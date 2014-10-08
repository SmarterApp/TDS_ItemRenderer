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
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;

/**
 * @author jmambo
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "objectLink"
})
@XmlRootElement(name = "contentLinkInfo")
public class ContentLinkInfo {

    @XmlElement(required = true)
    @XmlSchemaType(name = "anyURI")
    protected String objectLink;
    @XmlAttribute(name = "itsLinkIdentifierRef", required = true)
    protected String itsLinkIdentifierRef;
    @XmlAttribute(name = "subtype")
    protected String subtype;
    @XmlAttribute(name = "type", required = true)
    protected String type;

    /**
     * Gets the value of the objectLink property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getObjectLink() {
        return objectLink;
    }

    /**
     * Sets the value of the objectLink property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setObjectLink(String value) {
        this.objectLink = value;
    }

    /**
     * Gets the value of the itsLinkIdentifierRef property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getItsLinkIdentifierRef() {
        return itsLinkIdentifierRef;
    }

    /**
     * Sets the value of the itsLinkIdentifierRef property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setItsLinkIdentifierRef(String value) {
        this.itsLinkIdentifierRef = value;
    }

    /**
     * Gets the value of the subtype property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSubtype() {
        return subtype;
    }

    /**
     * Sets the value of the subtype property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSubtype(String value) {
        this.subtype = value;
    }

    /**
     * Gets the value of the type property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getType() {
        return type;
    }

    /**
     * Sets the value of the type property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setType(String value) {
        this.type = value;
    }

}
