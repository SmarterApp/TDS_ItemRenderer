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
import javax.xml.bind.annotation.XmlType;

/**
 * @author jmambo
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "contentLinkInfo",
    "relatedElementInfo"
})
@XmlRootElement(name = "accessElement")
public class AccessElement {

    @XmlElement(required = true)
    protected ContentLinkInfo contentLinkInfo;
    @XmlElement(required = true)
    protected RelatedElementInfo relatedElementInfo;
    @XmlAttribute(name = "identifier", required = true)
    protected String identifier;

    /**
     * Gets the value of the contentLinkInfo property.
     * 
     * @return
     *     possible object is
     *     {@link ContentLinkInfo }
     *     
     */
    public ContentLinkInfo getContentLinkInfo() {
        return contentLinkInfo;
    }

    /**
     * Sets the value of the contentLinkInfo property.
     * 
     * @param value
     *     allowed object is
     *     {@link ContentLinkInfo }
     *     
     */
    public void setContentLinkInfo(ContentLinkInfo value) {
        this.contentLinkInfo = value;
    }

    /**
     * Gets the value of the relatedElementInfo property.
     * 
     * @return
     *     possible object is
     *     {@link RelatedElementInfo }
     *     
     */
    public RelatedElementInfo getRelatedElementInfo() {
        return relatedElementInfo;
    }

    /**
     * Sets the value of the relatedElementInfo property.
     * 
     * @param value
     *     allowed object is
     *     {@link RelatedElementInfo }
     *     
     */
    public void setRelatedElementInfo(RelatedElementInfo value) {
        this.relatedElementInfo = value;
    }

    /**
     * Gets the value of the identifier property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getIdentifier() {
        return identifier;
    }

    /**
     * Sets the value of the identifier property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setIdentifier(String value) {
        this.identifier = value;
    }

}
