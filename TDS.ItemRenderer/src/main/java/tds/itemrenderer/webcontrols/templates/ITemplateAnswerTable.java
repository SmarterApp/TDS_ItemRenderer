/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols.templates;

import java.util.List;

public abstract class ITemplateAnswerTable extends MCBase
{
  // TODO Shiva: In the future we may need to make this
  // List<IUiRepeatDataElement>
  protected List<Object> _options = null;

  public void setOptions (List<Object> value) {
    _options = value;
  }

  public List<Object> getOptions () {
    return _options;
  }

}
