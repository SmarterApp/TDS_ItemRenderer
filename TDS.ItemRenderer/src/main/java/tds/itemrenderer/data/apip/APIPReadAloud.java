/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data.apip;

// / <summary>
// / The container for the alternative accessibility content that is to be
// rendered using read aloud formats.
// / Audio presentation of narrative text, graphic, or other content element can
// be provided in two ways.
// / For the first method, an audio file can be assigned to an element and the
// audio file can be played by the
// / test delivery system. A separate audio file may be created for each content
// element or a portion of an audio
// / file may be assigned to a content element. For the second method, a
// text-to-speech tool may be used to present
// / an audio representation of the element. Standard text-to-speech read aloud
// requires the item writer to specify
// / the text that is to be presented by the text-to-speech tool.
// / </summary>
// / <remarks>
// / TTS pronunciation is used for
// / </remarks>
public class APIPReadAloud
{
  // / <summary>
  // / This is the text string that is to be converted to the equivalent audio
  // format using a text-to-speech tool.
  // / The text is structured to provide explicit pronunciation guidance.
  // / </summary>
  // / <remarks>
  // / This is used when fixing the way existing content text sounds in a TTS
  // tool.
  // / </remarks>
  public String _ttsPronunciation = null;

  public String getTtsPronunciation () {
    return _ttsPronunciation;
  }

  public void setTtsPronunciation (String value) {
    _ttsPronunciation = value;
  }// <textToSpeechPronunciation>

  // / <summary>
  // / This is the text string that is to be converted to the equivalent audio
  // format using a text-to-speech tool.
  // / </summary>
  // / <remarks>
  // / This is used for adding text for an object (e.x., image) for use in a TTS
  // tool.
  // / </remarks>
  public String _audioText      = null;
  // <audioText>

  public String _audioShortDesc = null;

  public String _audioLongDesc  = null;

  public String getAudioLongDesc () {
    return _audioLongDesc;
  }

  public void setAudioLongDesc (String value) {
    _audioLongDesc = value;
  } // <audioLongDesc>

  public String getAudioText () {
    return _audioText;
  }

  public void setAudioText (String value) {
    _audioText = value;
  }

  public String getAudioShortDesc () {
    return _audioShortDesc;
  }

  public void setAudioShortDesc (String value) {
    _audioShortDesc = value;
  }// <audioShortDesc>

}
