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
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElements;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * @author jmambo
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "itemrelease")
public class Itemrelease {

    @XmlElements({
      @XmlElement(name="item", type=Item.class),
      @XmlElement(name="passage", type=Passage.class)
    })
    protected ItemPassage itemPassage;
    @XmlAttribute(name = "version", required = true)
    protected String version;

    /**
     * Gets the value of the itemPassage property.
     * 
     * @return
     *     possible object is
     *     {@link ItemPassage }
     *     
     */
    public ItemPassage getItemPassage() {
        return itemPassage;
    }

    /**
     * Sets the value of the itemPassage property.
     * 
     * @param value
     *     allowed object is
     *     {@link ItemPassage }
     *     
     */
    public void setItemPassage(ItemPassage value) {
        this.itemPassage = value;
    }

    /**
     * Gets the value of the version property.
     * 
     */
    public String getVersion() {
        return version;
    }

    /**
     * Sets the value of the version property.
     * 
     */
    public void setVersion(String value) {
        this.version = value;
    }

}
