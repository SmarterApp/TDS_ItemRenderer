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
import tds.itemrenderer.webcontrols.RendererBase;
import java.util.List;

public class ITemplateAnswer extends RendererBase implements IResponseLayout
{
  private List<ItemRenderMCOption> _options;

  public List<ItemRenderMCOption> getOptions () {
    return _options;
  }

  public void setOptions (List<ItemRenderMCOption> value) {
    _options = value;
  }
}
