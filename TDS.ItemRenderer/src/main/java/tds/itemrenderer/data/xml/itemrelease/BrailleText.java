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
    "brailleTextString",
    "brailleCode"
})
@XmlRootElement(name = "brailleText")
public class BrailleText {

    protected String brailleTextString;
    protected BrailleCode brailleCode;

    /**
     * Gets the value of the brailleTextString property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getBrailleTextString() {
        return brailleTextString;
    }

    /**
     * Sets the value of the brailleTextString property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setBrailleTextString(String value) {
        this.brailleTextString = value;
    }

    /**
     * Gets the value of the brailleCode property.
     * 
     * @return
     *     possible object is
     *     {@link BrailleCode }
     *     
     */
    public BrailleCode getBrailleCode() {
        return brailleCode;
    }

    /**
     * Sets the value of the brailleCode property.
     * 
     * @param value
     *     allowed object is
     *     {@link BrailleCode }
     *     
     */
    public void setBrailleCode(BrailleCode value) {
        this.brailleCode = value;
    }

}
