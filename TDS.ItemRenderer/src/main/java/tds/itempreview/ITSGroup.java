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
package tds.itempreview;

import java.util.List;

import AIR.Common.Utilities.TDSStringUtils;

import tds.itempreview.content.ITSDocumentExtensions;
import tds.itemrenderer.data.IITSDocument;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 *
 */
/// <summary>
/// Used to make an item group out of a ITSDocument's.
/// </summary>
public class ITSGroup
{
    final String _textFormat = "{0} - {1} {2} ({3})";

    private String _basePath = null;
    private String _groupId = null;
    private IITSDocument _passage = null;
    private List<IITSDocument> _items = null;
    
    public String getBasePath ()
    {
      return _basePath;
    }
    public void setBasePath(String value)
    {
      _basePath = value;
    }
        
    public String getGroupId(){
      return _groupId;
    }
    public void setGroupId (String value)
    {
      _groupId = value;
    }
    
    public IITSDocument getPassage()
    {
      return _passage;
    }
    public void setPassage(IITSDocument value)
    {
      _passage = value;
    }

    public List<IITSDocument> getItems(){
      return _items;
    }
    public void setItems(List<IITSDocument> value)
    {
      _items = value;
    }
    
    public ITSGroup(String groupID)
    {
        setGroupId(groupID);
    }

    public ITSGroup(String basePath, String groupID)
    {
        setBasePath (basePath);
        setGroupId(groupID);
    }

    public String getLabel()
    {
            String groupLabel;

            if (getPassage() != null)
            {
                groupLabel = TDSStringUtils.format("G-{0}-{1}", getPassage().getBankKey(), getPassage().getItemKey());
            }
            else if (getItems() != null && getItems().size () > 0)
            {
                groupLabel = TDSStringUtils.format("I-{0}-{1}", getItems().get(0).getBankKey(), getItems().get(0).getItemKey());
            }
            else
            {
                return "EMPTY";
            }

            IITSDocument entity = (getItems() != null && getItems().size () > 0) ? getItems().get(0) : getPassage();
            return TDSStringUtils.format(_textFormat, groupLabel, entity.getLayout(), entity.getResponseType(), entity.getFormat());
    }

    public String getGroupingText()
    {       
            return (getPassage() != null) ? ITSDocumentExtensions.getFolderName(getPassage()) : ITSDocumentExtensions.getFolderName(getItems().get(0));   
    }

    public String toString()
    {
        return getGroupId();
    }
}

