/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols.templates;

import tds.itemrenderer.data.ItemRenderMCOption;

public class MCBase extends BaseResponseTemplate
{
  private static ItemRenderMCOption getOption (Object container) {
    return (ItemRenderMCOption) container;
  }

  public String getId (Object container) {
    return getOption (container).getId ();
  }

  public String getName (Object container) {
    return getOption (container).getName ();
  }

  public boolean getIsDisabled (Object container) {
    return getOption (container).getDisabled ();
  }

  public String getIsDisabled (Object container, String disabledOutput) {
    if (getIsDisabled (container)) {
      return disabledOutput;
    }

    return "";
  }

  public boolean getIsSelected (Object container) {
    return getOption (container).getSelected ();
  }

  public String getIsSelected (Object container, String selectedOutput) {
    if (getIsSelected (container)) {
      return selectedOutput;
    }
    return "";
  }

  public String getKey (Object container) {
    return getOption (container).getKey ();
  }

  public boolean getIsAnswer (Object container) {
    return getOption (container).getAnswer();
  }

  public String getText (Object container) {
    return getOption (container).getText();
  }
}
