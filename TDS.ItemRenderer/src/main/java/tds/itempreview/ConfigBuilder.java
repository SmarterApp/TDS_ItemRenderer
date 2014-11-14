/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/**
 * 
 */
package tds.itempreview;

import java.io.File;
import java.net.URI;
import java.net.URISyntaxException;
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
import org.apache.commons.lang.StringUtils;

import AIR.Common.Utilities.Path;
import AIR.Common.Web.Session.Server;
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
  private URI                      _docBaseUri;
  private final String             _contentPath;
  private String                   _filterFormat;
  private String                   _filterResponseType;
  private Collection<IITSDocument> _itsDocuments;

  public Collection<IITSDocument> getDocuments () {
    return _itsDocuments;
  }

  public String getFilterFormat () {
    return _filterFormat;
  }

  public void setFilterFormat (String value) {
    _filterFormat = value;
  }

  public String getFilterResponseType () {
    return _filterResponseType;
  }

  public void setFilterResponseType (String value) {
    _filterResponseType = value;
  }

  public ConfigBuilder (String contentPath) throws URISyntaxException {
    _contentPath = contentPath;
    _docBaseUri = new URI ("file:///" + StringUtils.replace (Server.getDocBasePath (), "\\", "/"));
  }

  public Config create () {
    // parse all the ITS documents in the content path
    _itsDocuments = getITSDocuments (_contentPath);
    if (_itsDocuments != null)
      _itsDocuments = Collections.unmodifiableCollection (_itsDocuments);
    // group and sort the ITS documents by folders
    Collection<IGrouping<String, IITSDocument>> groupDocumentsByFolders = groupDocumentsByParentFolder (_itsDocuments);

    List<ITSGroups> itsGroupsList = new ArrayList<ITSGroups> ();

    // go through each folders ITS documents
    for (IGrouping<String, IITSDocument> groupedDocuments : groupDocumentsByFolders) {
      // create ITS groups (which represent pages) from the folders contents
      ITSGroups itsGroups = createITSGroups (groupedDocuments);
      itsGroupsList.add (itsGroups);
    }

    // build a json config
    return buildConfigPages (itsGroupsList);
  }

  // / <summary>
  // / Takes an array of xml files and parses into passage/item documents.
  // / </summary>
  private Collection<IITSDocument> getITSDocuments (String contentPath) {
    // get all xml files in the content path
    Collection<File> xmlFiles = Path.getFilesMatchingExtensions (_contentPath, new String[] { "xml" });

    Collection<IITSDocument> returnList = new ArrayList<IITSDocument> ();

    for (File file : xmlFiles) {
      String xmlFile = file.getAbsolutePath ();
      try {
        IITSDocument itsDocument = correctBaseUri (ITSDocumentFactory.loadUri2 (xmlFile, AccLookup.getNone (), false));

        returnList.add (itsDocument);

      } catch (Exception exp) {
        exp.printStackTrace ();
      }
    }
    return returnList;
  }

  private Collection<IGrouping<String, IITSDocument>> groupDocumentsByParentFolder (Collection<IITSDocument> itsDocuments) {
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

  private ITSGroups createITSGroups (Collection<IITSDocument> itsDocuments) {
    boolean ignorePassages = ItemPreviewSettings.getIgnorePassages ().getValue ();

    List<IITSDocument> itsPassages = new ArrayList<IITSDocument> ();
    List<IITSDocument> itsItems = new ArrayList<IITSDocument> ();

    // split up passages and items
    for (IITSDocument itsDocument : itsDocuments) {
      if (itsDocument.getType () == ITSEntityType.Passage) {
        if (ignorePassages)
          itsPassages.add (itsDocument);
      } else if (itsDocument.getType () == ITSEntityType.Item) {
        itsItems.add (itsDocument);
      }
    }

    Map<String, ITSGroup> groupLookup = new HashMap<String, ITSGroup> ();

    // create groups out of the passages
    for (IITSDocument itsPassage : itsPassages) {
      String groupID = itsPassage.getGroupID ();
      if (groupLookup.containsKey (groupID))
        continue;

      ITSGroup itsGroup = new ITSGroup (groupID);
      itsGroup.setPassage (itsPassage);
      groupLookup.put (groupID, itsGroup);
    }

    for (IITSDocument item : itsItems) {
      String itemGroupID = item.getGroupID ();

      // check if passage
      if (ignorePassages && item.getStimulusKey () > 0) {
        // use item id instead of group
        itemGroupID = item.getID ();
      }

      ITSGroup group = null;
      if (groupLookup.containsKey (itemGroupID))
        group = groupLookup.get (itemGroupID);

      if (group == null) {
        group = new ITSGroup (itemGroupID);
        groupLookup.put (itemGroupID, group);
      }

      if (group.getItems () == null)
        group.setItems (new ArrayList<IITSDocument> ());
      group.getItems ().add (item);
    }

    ITSGroups itsGroups = new ITSGroups ();
    for (ITSGroup itsGroup : groupLookup.values ()) {
      // if there is a filter ignore empty groups
      if (getFilterFormat () != null || getFilterResponseType () != null) {
        if (itsGroup.getItems () == null || itsGroup.getItems ().size () == 0)
          continue;
      }
      itsGroups.add (itsGroup);
    }
    return itsGroups;
  }

  private Config buildConfigPages (Collection<ITSGroups> itsGroupsList) {
    boolean ignorePassages = ItemPreviewSettings.getIgnorePassages ().getValue ();
    String passageLayout = ItemPreviewSettings.getPassageLayout ().getValue ();
    boolean passageReplace = ignorePassages && !(StringUtils.isEmpty (passageLayout) || StringUtils.isWhitespace (passageLayout));

    Config config = new Config ();
    config.setSections (new ArrayList<Section> ());
    config.setPages (new ArrayList<Page> ());

    for (ITSGroups itsGroups : itsGroupsList) {
      ITSGroup firstGroup = itsGroups == null || itsGroups.size () == 0 ? null : itsGroups.get (0);
      if (firstGroup == null)
        continue;

      String sectionLbl = firstGroup.getGroupingText ();
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
          setDocumentInfo (configPassage, itsGroup.getPassage ());
          configPage.setPassage (configPassage);
        }

        // create items
        if (itsGroup.getItems () != null && itsGroup.getItems ().size () > 0) {
          configPage.setItems (new ArrayList<Item> ());

          for (IITSDocument itsItem : itsGroup.getItems ()) {
            Item configItem = new Item ();
            setDocumentInfo (configItem, itsItem);
            configPage.getItems ().add (configItem);

            // check if replace passage layout
            if (passageReplace && itsGroup.getItems ().size () == 1 && itsItem.getStimulusKey () > 0) {
              configPage.setLayoutName (passageLayout);
            }
          }

        }

        config.getPages ().add (configPage);
      }
    }

    return config;
  }

  private void setFilePath (Content configContent, IITSDocument itsDocument) {
    configContent.setFile (itsDocument.getBaseUri ());
  }

  // / <summary>
  // / Add ITS document info to the config content object.
  // / </summary>
  private void setDocumentInfo (Content configContent, IITSDocument itsDocument) {
    configContent.setFile (itsDocument.getBaseUri ());

    if (configContent instanceof Item) {
      Item configItem = (Item) configContent;
      configItem.setBankKey (itsDocument.getBankKey ());
      configItem.setItemKey (itsDocument.getItemKey ());
    }
  }

  // Shiva: hack! the problem is ITSDocumentFactory.loadUri2 internally calls
  // getUriOriginalString() and that is definitely buggy. Talk to John about
  // that.
  // it drops the protocol. So what we will do is if the uri parameter starts
  // with the uri for current doc base then we will convert into a relative
  // path.
  private IITSDocument correctBaseUri (IITSDocument itsDocument) {
    String itsDocumentBaseUri = itsDocument.getBaseUri ();
    int indexOf = itsDocumentBaseUri.indexOf (_docBaseUri.getRawPath ());
    if (indexOf == 0) {
      itsDocumentBaseUri = itsDocumentBaseUri.substring (_docBaseUri.getRawPath ().length ());
      if (itsDocumentBaseUri.startsWith ("/"))
        itsDocument.setBaseUri ("~" + itsDocumentBaseUri);
      else
        itsDocument.setBaseUri ("~/" + itsDocumentBaseUri);
    }
    return itsDocument;
  }
}
