/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/**
 * 
 */
package tds.itemrenderer.qti;

import org.jdom2.Element;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class QTINodeException extends QTIException
{
  private final Element _node;

  public QTINodeException (Element node, String message) {
    super (message);
    _node = node;
  }

  public Element getNode () {
    return _node;
  }
}
