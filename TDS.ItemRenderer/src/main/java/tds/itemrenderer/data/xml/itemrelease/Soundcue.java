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
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

/**
 * @author jmambo
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "")
@XmlRootElement(name = "soundcue")
public class Soundcue {

    @XmlAttribute(name = "bankkey", required = true)
    protected String bankkey;
    @XmlAttribute(name = "id", required = true)
    protected String id;

    /**
     * Gets the value of the bankkey property.
     * 
     */
    public String getBankkey() {
        return bankkey;
    }

    /**
     * Sets the value of the bankkey property.
     * 
     */
    public void setBankkey(String value) {
        this.bankkey = value;
    }

    /**
     * Gets the value of the id property.
     * 
     */
    public String getId() {
        return id;
    }

    /**
     * Sets the value of the id property.
     * 
     */
    public void setId(String value) {
        this.id = value;
    }

}
