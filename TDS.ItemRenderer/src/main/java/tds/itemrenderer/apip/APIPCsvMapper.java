/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.apip;

/**
 * Use by ICsvBeanReader to map apip.csv contents to this class
 *  
 * @author jmambo
 *
 */
public class APIPCsvMapper
{
    private String code;
    private String type;
    private String subtype;
    private String tag;
    private String context;
    private String order;
    private String priority;

    public APIPCsvMapper() {
    }

    public String getCode () {
      return code;
    }

    public void setCode (String code) {
      this.code = code;
    }

    public String getType () {
      return type;
    }

    public void setType (String type) {
      this.type = type;
    }

    public String getSubtype () {
      return subtype;
    }

    public void setSubtype (String subtype) {
      this.subtype = subtype;
    }

    public String getTag () {
      return tag;
    }

    public void setTag (String tag) {
      this.tag = tag;
    }

    public String getContext () {
      return context;
    }

    public void setContext (String context) {
      this.context = context;
    }

    public String getOrder () {
      return order;
    }

    public void setOrder (String order) {
      this.order = order;
    }

    public String getPriority () {
      return priority;
    }

    public void setPriority (String priority) {
      this.priority = priority;
    }

}
