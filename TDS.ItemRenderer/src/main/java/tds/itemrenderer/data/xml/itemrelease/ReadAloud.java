/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data.xml.itemrelease;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

/**
 * @author jmambo
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "textToSpeechPronunciation",
    "textToSpeechPronunciationAlternate",
    "audioShortDesc",
    "audioLongDesc",
    "audioText"
})
@XmlRootElement(name = "readAloud")
public class ReadAloud {

    protected String textToSpeechPronunciation;
    protected String textToSpeechPronunciationAlternate;
    protected String audioShortDesc;
    protected String audioLongDesc;
    protected String audioText;

    /**
     * Gets the value of the textToSpeechPronunciation property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getTextToSpeechPronunciation() {
        return textToSpeechPronunciation;
    }

    /**
     * Sets the value of the textToSpeechPronunciation property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setTextToSpeechPronunciation(String value) {
        this.textToSpeechPronunciation = value;
    }

    /**
     * Gets the value of the textToSpeechPronunciationAlternate property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getTextToSpeechPronunciationAlternate() {
        return textToSpeechPronunciationAlternate;
    }

    /**
     * Sets the value of the textToSpeechPronunciationAlternate property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setTextToSpeechPronunciationAlternate(String value) {
        this.textToSpeechPronunciationAlternate = value;
    }

    /**
     * Gets the value of the audioShortDesc property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAudioShortDesc() {
        return audioShortDesc;
    }

    /**
     * Sets the value of the audioShortDesc property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAudioShortDesc(String value) {
        this.audioShortDesc = value;
    }

    /**
     * Gets the value of the audioLongDesc property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAudioLongDesc() {
        return audioLongDesc;
    }

    /**
     * Sets the value of the audioLongDesc property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAudioLongDesc(String value) {
        this.audioLongDesc = value;
    }

    /**
     * Gets the value of the audioText property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAudioText() {
        return audioText;
    }

    /**
     * Sets the value of the audioText property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAudioText(String value) {
        this.audioText = value;
    }

}
