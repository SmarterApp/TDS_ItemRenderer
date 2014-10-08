/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

import java.net.URI;
import java.net.URISyntaxException;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/// This is the machine rubric used for scoring an item.
public class ITSMachineRubric
{
  private static final Logger _logger = LoggerFactory.getLogger(ITSMachineRubric.class);
	
  public enum ITSMachineRubricType {Uri, Text };
  
  private ITSMachineRubricType _type; // { get; set; }
  private String _data; // { get; set; }
  private boolean _isValid;

  public ITSMachineRubric()
  {
  }

  public ITSMachineRubric(ITSMachineRubricType type, String data)
  {
    _type = type;
    _data = data;
  }

    
  public ITSMachineRubricType getType () {
    return _type;
  }

  public void setType (ITSMachineRubricType type) {
    _type = type;
  }

  public String getData () {
    return _data;
  }

  public void setData (String data) {
    _data = data;
  }

  /// Checks if the machine rubric has valid data.

  public boolean getIsValid()
  {
   return (!StringUtils.isEmpty(_data)); 
  }

  @Override
  public String toString()
  {
    return _data;
  }
  
  public URI createUri() {
	  URI uri = null;
      if (_type == ITSMachineRubricType.Uri)
      {
    	  try {
    		  uri = new URI(_data);
    	  } catch (URISyntaxException e) {
    		  _logger.error(e.getMessage(), e);
    	  }
      }

      return uri;
  }
}

