/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data.xml.itemrelease;

import java.util.ArrayList;
import java.util.List;
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
    "sample"
})
@XmlRootElement(name = "samplelist")
public class Samplelist {

    @XmlElement(required = true)
    protected List<Sample> sample;
    @XmlAttribute(name = "maxval", required = true)
    protected String maxval;
    @XmlAttribute(name = "minval", required = true)
    protected String minval;

    /**
     * Gets the value of the sample property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the sample property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getSample().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Sample }
     * 
     * 
     */
    public List<Sample> getSample() {
        if (sample == null) {
            sample = new ArrayList<Sample>();
        }
        return this.sample;
    }

    /**
     * Gets the value of the maxval property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMaxval() {
        return maxval;
    }

    /**
     * Sets the value of the maxval property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMaxval(String value) {
        this.maxval = value;
    }

    /**
     * Gets the value of the minval property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMinval() {
        return minval;
    }

    /**
     * Sets the value of the minval property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMinval(String value) {
        this.minval = value;
    }

}
