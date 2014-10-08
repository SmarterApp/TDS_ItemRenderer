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

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Dictionary;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.Predicate;
import org.apache.commons.collections.Transformer;
import org.apache.commons.io.FileUtils;
import org.apache.myfaces.shared.util.StringUtils;

import AIR.Common.Utilities.Path;
import AIR.Common.collections.IGrouping;

import tds.itempreview.content.ITSDocumentExtensions;
import tds.itemrenderer.ITSDocumentFactory;
import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.ITSDocument;
import tds.itemrenderer.data.ITSTypes.ITSEntityType;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
// / <summary>
// / Builds a json config based on file path.
// / </summary>
public class ConfigBuilder
{
  private final String _contentPath;

  public ConfigBuilder (String contentPath) {
    _contentPath = contentPath;
  }

  public Config Create () {
    // get all xml files in the content path
    Collection<File> xmlFiles = Path.getFilesMatchingExtensions (_contentPath, new String[] { "xml" });

    // parse all the ITS documents in the content path
    Collection<IITSDocument> itsDocuments = GetITSDocuments (xmlFiles);

    // group and sort the ITS documents by folders
    Collection<IGrouping<String, IITSDocument>> groupDocumentsByFolders = GroupDocumentsByParentFolder (itsDocuments);

    List<ITSGroups> itsGroupsList = new ArrayList<ITSGroups> ();

    // go through each folders ITS documents
    for (IGrouping<String, IITSDocument> groupedDocuments : groupDocumentsByFolders) {
      // create ITS groups (which represent pages) from the folders contents
      ITSGroups itsGroups = CreateITSGroups (groupedDocuments);
      itsGroupsList.add (itsGroups);
    }

    // build a json config
    return BuildConfigPages (itsGroupsList);
  }

  // / <summary>
  // / Takes an array of xml files and parses into passage/item documents.
  // / </summary>
  private Collection<IITSDocument> GetITSDocuments (Collection<File> xmlFiles) {
    Collection<IITSDocument> returnList = new ArrayList<IITSDocument> ();
    // TODO Shiva
    for (File file : xmlFiles) {
      String xmlFile = file.getAbsolutePath ();
      IITSDocument itsDocument = ITSDocumentFactory.loadUri2 (xmlFile, AccLookup.getNone (), false);

      if (itsDocument.getType () != ITSEntityType.Unknown) {
        returnList.add (itsDocument);
      }
    }
    return returnList;
  }

  private Collection<IGrouping<String, IITSDocument>> GroupDocumentsByParentFolder (Collection<IITSDocument> itsDocuments) {
    Transformer groupTransformer = new Transformer ()
    {

      @Override
      public Object transform (Object itsDocument) {
        return ((IITSDocument) itsDocument).getFolderName ();
      }
    };

    List<IGrouping<String, IITSDocument>> returnList = IGrouping.<String, IITSDocument> createGroups (itsDocuments, groupTransformer);

    Collections.sort (returnList, new Comparator<IGrouping<String, IITSDocument>> ()
    {
      @Override
      public int compare (IGrouping<String, IITSDocument> o1, IGrouping<String, IITSDocument> o2) {
        return o1.getKey ().compareTo (o2.getKey ());
      }
    });

    return returnList;
  }

  private ITSGroups CreateITSGroups (Collection<IITSDocument> itsDocuments) {
    List<IITSDocument> itsPassages = new ArrayList<IITSDocument> ();
    List<IITSDocument> itsItems = new ArrayList<IITSDocument> ();

    // split up passages and items
    for (IITSDocument itsDocument : itsDocuments) {
      if (itsDocument.getType () == ITSEntityType.Passage) {
        itsPassages.add (itsDocument);
      } else if (itsDocument.getType () == ITSEntityType.Item) {
        itsItems.add (itsDocument);
      }
    }

    Map<String, ITSGroup> itsGroups = new HashMap<String, ITSGroup> ();

    // create groups out of the passages
    for (IITSDocument itsPassage : itsPassages) {
      String groupID = itsPassage.getGroupID ();
      if (itsGroups.containsKey (groupID))
        continue;

      ITSGroup itsGroup = new ITSGroup (groupID);
      itsGroup.setPassage (itsPassage);
      itsGroups.put (groupID, itsGroup);
    }

    for (IITSDocument item : itsItems) {
      String itemGroupID = item.getGroupID ();
      ITSGroup group = null;
      if (itsGroups.containsKey (itemGroupID))
        group = itsGroups.get (itemGroupID);

      if (group == null) {
        group = new ITSGroup (itemGroupID);
        itsGroups.put (itemGroupID, group);
      }

      if (group.getItems () == null)
        group.setItems (new ArrayList<IITSDocument> ());
      group.getItems ().add (item);
    }

    return new ITSGroups (itsGroups.values ());
  }

  private Config BuildConfigPages (Collection<ITSGroups> itsGroupsList) {
    Config config = new Config ();
    config.setSections (new ArrayList<Section> ());
    config.setPages (new ArrayList<Page> ());

    for (ITSGroups itsGroups : itsGroupsList) {
      String sectionLbl = ((ITSGroup) CollectionUtils.find (itsGroups, new Predicate ()
      {

        @Override
        public boolean evaluate (Object arg0) {
          return true;
        }
      })).getGroupingText ();
      String sectionID = StringUtils.replace (sectionLbl, " ", "");

      // create section
      Section configSection = new Section ();
      configSection.setId (sectionID);
      configSection.setLabel (sectionLbl);
      config.getSections ().add (configSection);

      // create pages
      for (ITSGroup itsGroup : itsGroups) {
        Page configPage = new Page ();
        // configPage.ID = itsGroup.GroupID;
        configPage.setLabel (itsGroup.getLabel ());
        configPage.setSectionId (configSection.getId ());

        // create passage
        if (itsGroup.getPassage () != null) {
          Content configPassage = new Content ();
          SetFilePath (configPassage, itsGroup.getPassage ());
          configPage.setPassage (configPassage);
        }

        // create items
        if (itsGroup.getItems () != null && itsGroup.getItems ().size () > 0) {
          configPage.setItems (new ArrayList<Item> ());

          for (IITSDocument itsItem : itsGroup.getItems ()) {
            Item configItem = new Item ();
            SetFilePath (configItem, itsItem);
            configPage.getItems ().add (configItem);
          }
        }

        config.getPages ().add (configPage);
      }
    }

    return config;
  }

  private void SetFilePath (Content configContent, IITSDocument itsDocument) {
    configContent.setFile (itsDocument.getBaseUri ());
  }

}
