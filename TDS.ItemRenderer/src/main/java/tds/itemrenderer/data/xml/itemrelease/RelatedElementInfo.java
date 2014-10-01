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
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

/**
 * @author jmambo
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "readAloud",
    "brailleText"
})
@XmlRootElement(name = "relatedElementInfo")
public class RelatedElementInfo {

    @XmlElement(required = true)
    protected ReadAloud readAloud;
    @XmlElement(required = true)
    protected BrailleText brailleText;

    /**
     * Gets the value of the readAloud property.
     * 
     * @return
     *     possible object is
     *     {@link ReadAloud }
     *     
     */
    public ReadAloud getReadAloud() {
        return readAloud;
    }

    /**
     * Sets the value of the readAloud property.
     * 
     * @param value
     *     allowed object is
     *     {@link ReadAloud }
     *     
     */
    public void setReadAloud(ReadAloud value) {
        this.readAloud = value;
    }

    /**
     * Gets the value of the brailleText property.
     * 
     * @return
     *     possible object is
     *     {@link BrailleText }
     *     
     */
    public BrailleText getBrailleText() {
        return brailleText;
    }

    /**
     * Sets the value of the brailleText property.
     * 
     * @param value
     *     allowed object is
     *     {@link BrailleText }
     *     
     */
    public void setBrailleText(BrailleText value) {
        this.brailleText = value;
    }

}
