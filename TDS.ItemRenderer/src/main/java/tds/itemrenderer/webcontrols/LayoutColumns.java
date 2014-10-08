/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols;

public class LayoutColumns extends ILayout
{
  private LayoutHolder _column1;
  private LayoutHolder _column2;
  
  public LayoutHolder getColumn1()
  {
    return _column1;
  }
  
  public void setColumn1(LayoutHolder value)
  {
    _column1 = value;
  }

  public LayoutHolder getColumn2()
  {
    return _column2;
  }
  
  public void setColumn2(LayoutHolder value)
  {
    _column2 = value;
  }
}
