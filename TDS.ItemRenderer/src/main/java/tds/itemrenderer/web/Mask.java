/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.web;

public class Mask
{
  public static String nullString (String actual) {
    return actual == null ? "" : actual;
  }

  public static String NullString (String actual, String mask) {
    return actual == null ? mask : actual;
  }

  public static String EmptyString (String actual, String emptyValue) {
    return nullString (actual).length () == 0 ? emptyValue : actual;
  }

  private Mask () {
    throw new NotSupportedException ();
  }
}
