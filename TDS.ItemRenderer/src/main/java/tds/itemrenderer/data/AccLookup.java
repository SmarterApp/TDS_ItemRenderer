/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.Predicate;
import org.apache.commons.lang.StringUtils;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import tds.itemrenderer.data.AccProperties;
import AIR.Common.Utilities.TDSStringUtils;
import AIR.Common.collections.MultiValueDictionary;

/*
 * Class Notes Changed C# IEnumberable to Iterable
 */
public class AccLookup
{
  private static final AccLookup               _empty = new AccLookup (-1, null);
  private static AccLookup                     _none;
  private int                                  _position;
  private String                               _id;
  private MultiValueDictionary<String, String> _types = new MultiValueDictionary<String, String> ();

  public AccLookup () {
  }

  public AccLookup (int position) {
    _position = position;
  }

  public AccLookup (int position, String ID) {
    _position = position;
    _id= ID;
  }

  @JsonIgnore
  public static AccLookup getNone () {
    return _empty;
  }
/*
  public AccProperties getProperties () {
    return new AccProperties (this);
  }
*/
 @JsonProperty
  public int getPosition () {
    return _position;
  }
  
  public void setPosition (int _position) {
    this._position = _position;
  }
  @JsonProperty
  public String getId () {
    return _id;
  }

  public void setId (String _id) {
    this._id = _id;
  }
  @JsonIgnore
  public MultiValueDictionary<String, String> getTypesMap () {
    return _types;
  }

  public void setTypesMap (MultiValueDictionary<String, String> _types) {
    this._types = _types;
  }

  public void add (String type, String... codes) {
    for (String str : codes) {
      _types.add (type, str);
    }
  }

  public boolean hasType (String type) {
    return CollectionUtils.exists (getCodes (type), new Predicate ()
    {
      @Override
      public boolean evaluate (Object arg0) {
        return true;
      }
    });
  }
  @JsonProperty
  public MultiValueDictionary<String, String> getTypes () {
    return _types;
  }

  // / Get all the codes for a type.
  @JsonIgnore
  public Collection<String> getCodes (String type, boolean split) {
    List<String> outputList = new ArrayList<String> ();

    HashSet<String> codes = _types.getValues (type, false);

    if (codes != null) {
      for (String code : codes) {
        if (split) {
          String[] splitCodes = code.split ("&");

          for (String splitCode : splitCodes) {
            outputList.add (splitCode);
          }
        } else {
          outputList.add (code);
        }
      }
    }

    return outputList;
  }

  @JsonIgnore
  public Collection<String> getCodes (String type) {
    return getCodes (type, false);
  }

  // / Get the first code for a type.
  @JsonIgnore
  public String getCode (String type) {
    return (String) CollectionUtils.find (getCodes (type), new Predicate ()
    {
      @Override
      public boolean evaluate (Object arg0) {
        return true;
      }
    });
  }

  // / Get all the codes.
  @JsonIgnore
  public Collection<String> getCodes () {
    return getCodes (false);
  }

  @JsonIgnore
  public Collection<String> getCodes (boolean split) {
    List<String> returnList = new ArrayList<String> ();
    for (String type : getTypes ().keySet ()) {
      for (String code : getCodes (type, split)) {
        returnList.add (code);
      }
    }
    return returnList;
  }

  // / Check if a type and code exists.
  public boolean exists (String type, final String checkCode) {
    return CollectionUtils.exists (getCodes (type, true), new Predicate ()
    {
      @Override
      public boolean evaluate (Object code) {
        return StringUtils.equals (checkCode, code.toString ());
      }
    });
  }

  // / Remove a type from the collection.
  public void remove (String type) {
    _types.remove (type);
  }

  public AccLookup clone (int position, String id) {
    AccLookup accClone = new AccLookup (position, id);

    for (Map.Entry<String, HashSet<String>> keyValuePair : _types.entrySet ()) {
      String type = keyValuePair.getKey ();
      String[] codes = keyValuePair.getValue ().toArray (new String[keyValuePair.getValue ().size ()]);
      accClone.add (type, codes);
    }

    return accClone;
  }

  public AccLookup clone () {
    return clone (_position, _id);
  }

  public void replaceWith (AccLookup other) {
    for (String type : other.getTypes ().keySet ()) {
      if (hasType (type))
        remove (type);

      for (String code : other.getCodes (type)) {
        add (type, code);
      }
    }
  }

  // / Serialize this collection into a String.
  public String serialize () {
    List<String> list = new ArrayList<String> ();

    for (String type : getTypes ().keySet ()) {
      String codes = StringUtils.join (_types.getValues (type, true), ',');
      list.add (TDSStringUtils.format ("{0}:{1}", type, codes));
    }

    return StringUtils.join (list, '|');
  }

  // / Deserialize a serialized String into this collection.
  // / <param name="serialized"></param>
  public void deserialize (String serialized) {
    if (StringUtils.isEmpty (serialized))
      return;

    for (String typeCodes : serialized.split ("|")) {
      String[] typeCodesPieces = typeCodes.split (":");
      String type = typeCodesPieces[0];
      String codes = typeCodesPieces[1];

      for (String code : codes.split (",")) {
        add (type, code);
      }
    }
  }
  
  /*
   * As part of our merging process we needed to make this one change in ItemRenderer.
   * The new acc lookup string is separaterd by ";" instad of "|".
   */
  // / Deserialize a serialized String into this collection.
  // / <param name="serialized"></param>
  public void deserializeSemiColonSeparated (String serialized) {
    if (StringUtils.isEmpty (serialized))
      return;

    for (String typeCodes : StringUtils.split (serialized, "|;")) {
      String[] typeCodesPieces = typeCodes.split (":");
      String type = typeCodesPieces[0];
      String codes = typeCodesPieces[1];

      for (String code : codes.split (",")) {
        add (type, code);
      }
    }
  }

  // / <summary>
  // / Get the accommodations as a strongly typed object.
  // / </summary>
  @JsonIgnore
  public AccProperties getProperties () {
    return new AccProperties (this);
  }
}
