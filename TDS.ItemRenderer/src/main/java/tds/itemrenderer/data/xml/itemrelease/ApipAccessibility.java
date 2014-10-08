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
    "accessibilityInfo"
})
@XmlRootElement(name = "apipAccessibility")
public class ApipAccessibility {

    @XmlElement(required = true)
    protected AccessibilityInfo accessibilityInfo;

    /**
     * Gets the value of the accessibilityInfo property.
     * 
     * @return
     *     possible object is
     *     {@link AccessibilityInfo }
     *     
     */
    public AccessibilityInfo getAccessibilityInfo() {
        return accessibilityInfo;
    }

    /**
     * Sets the value of the accessibilityInfo property.
     * 
     * @param value
     *     allowed object is
     *     {@link AccessibilityInfo }
     *     
     */
    public void setAccessibilityInfo(AccessibilityInfo value) {
        this.accessibilityInfo = value;
    }

}
