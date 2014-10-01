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
@XmlType(name = "KeepChildrenValues")
@XmlEnum
public enum KeepChildrenValues {

    @XmlEnumValue("all")
    ALL("all"),
    @XmlEnumValue("textOnly")
    TEXT_ONLY("textOnly"),
    @XmlEnumValue("none")
    NONE("none"),
    @XmlEnumValue("specifiedonlyandtext")
    SPECIFIEDONLYANDTEXT("specifiedonlyandtext"),
    @XmlEnumValue("specifiedonly")
    SPECIFIEDONLY("specifiedonly");
    private final String value;

    KeepChildrenValues(String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    public static KeepChildrenValues fromValue(String v) {
        for (KeepChildrenValues c: KeepChildrenValues.values()) {
            if (c.value.equals(v)) {
                return c;
            }
        }
        throw new IllegalArgumentException(v);
    }

}
