/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *       
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox.abstractions.repository;

public class ContentException extends RuntimeException
{
  public ContentException (String message) {
    super (message);
  }

  public ContentException (Exception exp) {
    super (exp);
  }

  public ContentException (String message, Exception exp) {
    super (message, exp);
  }
}
