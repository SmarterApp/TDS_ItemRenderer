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
    "name",
    "annotation",
    "samplecontent"
})
@XmlRootElement(name = "sample")
public class Sample {

    @XmlElement(required = true)
    protected String name;
    @XmlElement(required = true)
    protected String annotation;
    protected String samplecontent;
    @XmlAttribute(name = "purpose", required = true)
    protected String purpose;
    @XmlAttribute(name = "scorepoint", required = true)
    protected String scorepoint;

    /**
     * Gets the value of the name property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the value of the name property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setName(String value) {
        this.name = value;
    }

    /**
     * Gets the value of the annotation property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAnnotation() {
        return annotation;
    }

    /**
     * Sets the value of the annotation property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAnnotation(String value) {
        this.annotation = value;
    }

    /**
     * Gets the value of the samplecontent property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSamplecontent() {
        return samplecontent;
    }

    /**
     * Sets the value of the samplecontent property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSamplecontent(String value) {
        this.samplecontent = value;
    }

    /**
     * Gets the value of the purpose property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPurpose() {
        return purpose;
    }

    /**
     * Sets the value of the purpose property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPurpose(String value) {
        this.purpose = value;
    }

    /**
     * Gets the value of the scorepoint property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getScorepoint() {
        return scorepoint;
    }

    /**
     * Sets the value of the scorepoint property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setScorepoint(String value) {
        this.scorepoint = value;
    }

}
