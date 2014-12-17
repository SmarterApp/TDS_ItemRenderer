/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */

public class ContentRequestItem
{
  private int     _position = 0;
  private String  _response = null;
  private String  _file     = null;
  private boolean _disabled = false;
  private boolean _printable = false;
  private String  _label    = null;
  private long    _bankKey  = 0;
  private long    _itemKey  = 0;
  
  public long getBankKey(){
    return _bankKey;
  }
  public void setBankKey(long value){
    _bankKey = value;
  }
  
  public long getItemKey(){
    return _itemKey;
  }
  public void setItemKey(long value){
    _itemKey = value;
  }
  
  @JsonProperty("printable")
  public boolean getPrintable(){
    return _printable;
  }
  public void setPrintable(boolean value){
    _printable = value;
  }
  
  @JsonProperty("label")
  public String getLabel () {
    return _label;
  }

  public void setLabel (String value) {
    _label = value;
  }

  @JsonProperty("position")
  public int getPosition () {
    return _position;
  }

  public void setPosition (int value) {
    _position = value;
  }

  @JsonProperty("file")
  public String getFile () {
    return _file;
  }

  public void setFile (String value) {
    _file = value;
  }

  @JsonProperty("response")
  public String getResponse () {
    return _response;
  }

  public void setResponse (String value) {
    _response = value;
  }

  @JsonProperty("disabled")
  public boolean getDisabled () {
    return _disabled;
  }

  public void setDisabled (boolean value) {
    _disabled = value;
  }

  @Override
  public String toString () {
    return getFile ();
  }
}