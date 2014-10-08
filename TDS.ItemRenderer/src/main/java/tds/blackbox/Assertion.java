/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox;

import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;

import AIR.Common.Utilities.TDSStringUtils;

public class Assertion
{
  public class AssertionException extends Exception
  {
    public AssertionException () {
    }

    public AssertionException (String message) {
      super (message);
    }
  }

  public void equals (Object value1, Object value2) throws AssertionException {
    // TODO Ayo/Shiva ObjectUtils.Equals ?
    if (!ObjectUtils.equals (value1, value2))
      // TODO Ayo/Shiva Put in Try-Catch block? or put throws Exception in Method declaration
      throw new AssertionException (TDSStringUtils.format ("The value '{0}' does not equal '{1}'", value1, value2));
  }

  public void notEmpty (String value) throws AssertionException {
    if (StringUtils.isEmpty (value))
      throw new AssertionException ("The string was null or empty.");
  }

  public void notNull (Object value1) throws AssertionException {
    if (value1 == null)
      throw new AssertionException ();
  }

}
