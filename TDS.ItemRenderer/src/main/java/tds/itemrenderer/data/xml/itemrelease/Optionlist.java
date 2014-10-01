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
    "option"
})
@XmlRootElement(name = "optionlist")
public class Optionlist {

    @XmlElement(required = true)
    protected List<Option> option;
    @XmlAttribute(name = "maxChoices", required = true)
    protected String maxChoices;
    @XmlAttribute(name = "minChoices", required = true)
    protected String minChoices;

    /**
     * Gets the value of the option property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the option property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getOption().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Option }
     * 
     * 
     */
    public List<Option> getOption() {
        if (option == null) {
            option = new ArrayList<Option>();
        }
        return this.option;
    }

    /**
     * Gets the value of the maxChoices property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMaxChoices() {
        return maxChoices;
    }

    /**
     * Sets the value of the maxChoices property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMaxChoices(String value) {
        this.maxChoices = value;
    }

    /**
     * Gets the value of the minChoices property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMinChoices() {
        return minChoices;
    }

    /**
     * Sets the value of the minChoices property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMinChoices(String value) {
        this.minChoices = value;
    }

}
