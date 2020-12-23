#SingleInstance force
#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.

#Include Gdip_All.ahk

OnExit("ExitFunc")


; Configuration
global ImageEditorBin := "C:\Program Files (x86)\ImageOcclusionEditor\ImageOcclusionEditor.exe"
global OcclusionItemNamePattern := "[Occlusion]: {1}"         ; {1} Parent name
global OcclusionImageNamePattern := "__Occlusion: {1} {2}"    ; {1} Original image name {2} TimeStamp



; RegEx
; REC: RegEx Capture
; RER: RegEx Replace
global REC_Occlusion_Generic_Element := "UOsm)^Begin Element #(?P<Id>[\d]+).*^Title=(?P<Title>[^\n\r]+)$.*^ImageName=(?P<ImageName>[^\n\r]+)$[\r\n]+^ImageFile=(?P<ImageFile>[^\n\r]+)$"
global REC_Occlusion_Self_Element := "Osm).*^ImageFile=(?P<BackgroundImageFile>[^\n\r]+)$.*^ImageFile=(?P<OcclusionImageFile>[^\n\r]+)$"
global RER_Element_Generic := "=[^\n\r]+"
global RER_Element_ComponentsAndRepHistory := "sm)^Begin Component #.*End RepHist #[\d]+$"



; Shortcuts
global SCCompressImage := "{Alt down}{F10}nc{Alt up}"
global SCCopyElement := "{Alt down}{F10}oe{Alt up}"
global SCSetHook := "+{F10}cey"
;global SCPasteElement := "{Alt down}c{Alt up}{Ctrl down}v{Ctrl up}"



; Globals
global ClipboardBak := ""
global GdiGarbageCollector := 0
global GdiToken := CreateGdiToken()



; Other constants
global TimeFractionRatio := 1000 / 3600



; 

ExitFunc()
{
  Gdip_Shutdown(pToken)
}



; Helpers

StrEmpty(str)
{
  return StrLen(str) == 0
}

ShowWarning(str)
{
  MsgBox % "Warning: " . str
}

GetTimeFraction()
{
  return A_Hour . "." . Floor(((A_Min * 60) + A_Sec) * TimeFractionRatio)
}

GetTempFileName(ext = "")
{
  EnvGet, tempFolder, temp
  
  return tempFolder . "\supermemo" . A_TickCount . (StrEmpty(ext) ? "" : "." . ext)
}

WaitForFileToExist(filePath)
{
  count := 0
  
  While count < 3 && ! FileExist(filePath)
  {
    Sleep 100
    count++
  }
  
  return count < 3
}

RERElement(element, paramName, paramValue, rLimit = 1)
{
  return RegExReplace(element, "m)^" . paramName . RER_Element_Generic . "$", paramName . "=" . paramValue, "", rLimit)
}


; Image-related

CreateGdiToken()
{
  pToken := Gdip_Startup()
    
  if (!pToken)
  {
    ShowWarning("Gdiplus failed to start. Please ensure you have Gdiplus on your system")
    ExitApp
  }
  
  return pToken
}

GetImageSize(filePath, ByRef width, ByRef height)
{
  bitmap := Gdip_CreateBitmapFromFile(filePath)
  width := Gdip_GetImageWidth(bitmap)
  height := Gdip_GetImageHeight(bitmap)
  Gdip_DisposeImage(bitmap)
  
  return true
}

CreateTransparentImage(filePath, width, height)
{
  bitmap := Gdip_CreateBitmap(width, height)
  graphics := Gdip_GraphicsFromImage(bitmap)
  
  brush := Gdip_BrushCreateSolid(0x00000000)
  Gdip_FillRectangle(graphics, brush, 0, 0, width, height)
  Gdip_DeleteBrush(brush)
  
  success := Gdip_SaveBitmapToFile(bitmap, filePath) == 0
  
  Gdip_DisposeImage(bitmap)
  Gdip_DeleteGraphics(graphics)
  
  return success
}



; Window-related

GroupAdd, SuperMemo, ahk_class TBrowser ;Browser
GroupAdd, SuperMemo, ahk_class TContents ;Content Window (Knowledge Tree)
GroupAdd, SuperMemo, ahk_class TElWind ;Element window
GroupAdd, SuperMemo, ahk_class TSMMain ;Toolbar


SafeActivateWdw(wdwClass, waitActive)
{
  if WinExist("ahk_class " . wdwClass)
  {
    WinActivate ahk_class %wdwClass%
    
    if (waitActive)
      WinWaitActive ahk_class %wdwClass%
    
    return true
  }
  
  return false
}

ActivateBrowserWdw(waitActive = true, notify = false)
{
  found := SafeActivateWdw("TBrowser", waitActive)
  
  if (!found && notify)
    ShowWarning("No Browser Window found.")
    
  return found
}

ActivateContentWdw(waitActive = true, notify = false)
{
  found := SafeActivateWdw("TContents", waitActive)
  
  if (!found && notify)
    ShowWarning("No Content Window found.")
    
  return found
}

ActivateElementWdw(waitActive = true, notify = false)
{
  found := SafeActivateWdw("TElWind", waitActive)
  
  if (!found && notify)
    ShowWarning("No Element Window found.")
    
  return found
}

ActivateToolbarWdw(waitActive = true, notify = false)
{
  found := SafeActivateWdw("TSMMain", waitActive)
  
  if (!found && notify)
    ShowWarning("No Toolbar Window found.")
    
  return found
}



; Clipboard-related

ClipboardSave()
{
  ClipboardBak := Clipboard
  Clipboard := 
}

ClipboardRestore()
{
  Clipboard := ClipboardBak
  ClipboardBak := 
}



; SM Commands

CompressImage()
{
  if (ActivateElementWdw(true, true))
    Send % SCCompressImage
}

CopyElement()
{
  clipBak := Clipboard
  Clipboard := ""
  
  if (!ActivateElementWdw(true, true))
    return false
  
  
  Send % SCCopyElement
  ClipWait
  
  element := Clipboard
  Clipboard := clipBak
  
  return element
}

SetHook()
{
  if (ActivateContentWdw(true, true))
    Send, % SCSetHook
}



; Image Occlusion-related

OcclusionParseParentElement(element)
{
  RegExMatch(element, REC_Occlusion_Generic_Element, outMatch)

  return outMatch.Count() == 4 ? outMatch : false
}

OcclusionParseSelfElement(element)
{
  RegExMatch(element, REC_Occlusion_Self_Element, outMatch)

  return outMatch.Count() == 2 ? outMatch : false
}

OcclusionParseOcclusionFile(element)
{
  StringGetPos, startPos, element, ImageFile, L2
  StringGetPos, endPos, element, `r, L1, startPos
  
  startPos := startPos + StrLen("ImageFile") + 2
  length := endPos - startPos + 1
  
  return SubStr(element, startPos, length)
}

OcclusionFormatComponentsAndRepHistory(Id, ImageName, ImageFile, OcclusionImageName, OcclusionImageFile, RepDate, RepTime)
{
  ret =
    ( LTrim Join`r`n
    Begin Component #1
    Type=Image
    Cors=(1,1,9800,9800)
    DisplayAt=255
    Hyperlink=0
    ImageName=%ImageName%
    ImageFile=%ImageFile%
    Stretch=2
    ClickPlay=0
    TestElement=0
    Transparent=0
    Zoom=[0,0,0,0]
    End Component #1
    Begin Component #2
    Type=Image
    Cors=(1,1,9800,9800)
    DisplayAt=63
    Hyperlink=0
    ImageName=%OcclusionImageName%
    ImageFile=%OcclusionImageFile%
    Stretch=2
    ClickPlay=0
    TestElement=0
    Transparent=0
    Zoom=[0,0,0,0]
    End Component #2
    Begin RepHist #%Id%
    ElNo=%Id% Rep=1 Date=%RepDate% Hour=%RepTime% Int=0 Grade=8 Laps=0 expFI=99 Priority=0
    End RepHist #%Id%
    )
  
  return ret
}

OcclusionFormatNewItem(parentElement, parentId, parentTitle, parentImageName, parentImageFile, occlusionImageName, occlusionImageFile)
{
  repDate := RegExReplace(A_Now, "..(..)(..)(..)(..)(..)(..)", "$3.$2.$1")
  repTime := GetTimeFraction()
  
  compAndRep := OcclusionFormatComponentsAndRepHistory(parentId, parentImageName, parentImageFile, occlusionImageName, occlusionImageFile, repDate, repTime)
  
  out := parentElement
  out := RERElement(out, "Parent", parentId)
  out := RERElement(out, "ParentTitle", parentTitle)
  out := RERElement(out, "Title", Format(OcclusionItemNamePattern, parentTitle))
  out := RERElement(out, "Type", "Item")
  out := RERElement(out, "Status", "Memorized")
  out := RERElement(out, "FirstGrade", "8")
  out := RERElement(out, "Repetitions", "1")
  out := RERElement(out, "Lapses", "0")
  out := RERElement(out, "Interval", "3")
  out := RERElement(out, "LastRepetition", repDate)
  out := RERElement(out, "AFactor", "3.920")
  out := RERElement(out, "UFactor", "3.000")
  out := RERElement(out, "ForgettingIndex", "0")
  out := RERElement(out, "ComponentNo", "2")
  out := RegExReplace(out, RER_Element_ComponentsAndRepHistory, compAndRep)
  
  return out
}

OcclusionCreateSMItem(parentElement, parentId, parentTitle, parentImageName, parentImageFile, occlusionImageName, occlusionImageFile)
{
  Clipboard := OcclusionFormatNewItem(parentElement, parentId, parentTitle, parentImageName, parentImageFile, occlusionImageName, occlusionImageFile)
  
  ActivateContentWdw()
  
  Send !c
  WinWaitActive ahk_class TContents
  
  Send ^v
  WinWaitActive ahk_class TInputDlg
  
  Send !o
  WinWaitNotActive ahk_class TInputDlg
  
  return true
}

OcclusionCreate(parentElement, parentId, parentTitle, parentImageName, parentImageFile)
{
  occlusionImageName := Format(OcclusionImageNamePattern, parentImageName, A_TickCount)
  occlusionImageFile := GetTempFileName("png")
  
  success := GetImageSize(parentImageFile, width, height)
  success := success && CreateTransparentImage(occlusionImageFile, width, height)
  success := success && OcclusionCreateSMItem(parentElement, parentId, parentTitle, parentImageName, parentImageFile, occlusionImageName, occlusionImageFile)
  
  return success
}

OcclusionCreateAndEdit(parentElement, parentId, parentTitle, parentImageName, parentImageFile)
{
  if (!OcclusionCreate(parentElement, parentId, parentTitle, parentImageName, parentImageFile))
    return false
  
  newElement := CopyElement()
  occlusionImageFile := OcclusionParseOcclusionFile(newElement)
  
  Run, %ImageEditorBin% "%parentImageFile%" "%occlusionImageFile%"
  
  return true
}

OcclusionEdit(backgroundImageFile, occlusionImageFile)
{
  Run, %ImageEditorBin% %backgroundImageFile% %occlusionImageFile%
}



; Macros

#IfWinActive ahk_group SuperMemo


; Create Image Occlusion From Displayed Element (Ctrl+Win+o)
#^o::
  ClipboardSave()
  
  parentElement := CopyElement()
  
  if (!parentElement)
    return
    
  elemMatch := OcclusionParseParentElement(parentElement)
  
  if (!elemMatch)
  {
    ShowWarning("Element information could not be parsed.")
    
    parentElement :=
    
    return
  }
  
  OcclusionCreateAndEdit(parentElement, elemMatch.Id, elemMatch.Title, elemMatch.ImageName, elemMatch.ImageFile)

  elemMatch :=
  parentElement :=
    
  ClipboardRestore()
Return


; Edit Image Occlusion From Displayed Element (Ctrl+Win+e)
#^e::
  ClipboardSave()
  
  parentElement := CopyElement()
  
  if (!parentElement)
    return
    
  elemMatch := OcclusionParseSelfElement(parentElement)
  
  if (!elemMatch)
  {
    ShowWarning("Element information could not be parsed.")
    
    parentElement :=
    
    return
  }
  
  OcclusionEdit(elemMatch.BackgroundImageFile, elemMatch.OcclusionImageFile)

  elemMatch :=
  parentElement :=
    
  ClipboardRestore()
Return


; Compress Image (Ctrl+Win+c)
#^c::
  CompressImage()
Return

  
; Focus Element Window (Ctrl+Alt+C)
^!c::
  ActivateElementWdw(false, false)
Return  


; Set Hook (Ctrl+Win+h)
#^&::
  SetHook()
Return


; Remove title bar (Ctrl+Win+t)
#^t::
  WinSet, Style, -0xC00000, A
Return

#IfWinActive
