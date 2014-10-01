/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.apip.brftransformationrules;


import javax.xml.bind.annotation.XmlEnum;
import javax.xml.bind.annotation.XmlEnumValue;
import javax.xml.bind.annotation.XmlType;



/**
 * @author jmambo
 *
 */
@XmlType(name = "ContextType")
@XmlEnum
public enum ContextType {

    @XmlEnumValue("All")
    ALL("All"),
    @XmlEnumValue("Item")
    ITEM("Item"),
    @XmlEnumValue("Passage")
    PASSAGE("Passage"),
    @XmlEnumValue("Instruction")
    INSTRUCTION("Instruction"),
    @XmlEnumValue("Stem")
    STEM("Stem"),
    @XmlEnumValue("Option")
    OPTION("Option"),
    @XmlEnumValue("Grid")
    GRID("Grid"),
    @XmlEnumValue("Illustration")
    ILLUSTRATION("Illustration"),
    @XmlEnumValue("Title")
    TITLE("Title");
    private final String value;

    ContextType(String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    public static ContextType fromValue(String v) {
        for (ContextType c: ContextType.values()) {
            if (c.value.equals(v)) {
                return c;
            }
        }
        throw new IllegalArgumentException(v);
    }

}
