/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

public class ITSTypes
{

  // The entity type of the ITS xml document.
  public enum ITSEntityType {
    Unknown, Item, Passage;
  };

  // The content type contained in a ITS xml documents section.
  // For example the stem would be HTML and the grid would be XML.
  // [Flags]
  public enum ITSContentType {
    Html(1), Xml(1 << 1);
    
    private int _enum = 0;

    ITSContentType (int i) {
      _enum = i;
    }

    public int getValue () {
      return _enum;
    }
    
    public boolean hasFlag(int value) {
      return (getValue() & value) == value;
    }

  };

  // The context type of the content contained in a ITS xml documents section.
  // [Flags]
  public enum ITSContextType {
    All(1), Item(1 << 1), Passage(1 << 2), Instruction(1 << 3), Grid(1 << 4), Stem(1 << 5), Illustration(1 << 6), Option(1 << 7), Title(1 << 8), Spec(1 << 9), QTI(1 << 10);

    private int _enum = 0;

    public int getValue () {
      return _enum;
    }

    ITSContextType (int i) {
      _enum = i;
    }
    
    public boolean hasFlag(int value) {
      return (getValue() & value) == value;
    }
  };
}
