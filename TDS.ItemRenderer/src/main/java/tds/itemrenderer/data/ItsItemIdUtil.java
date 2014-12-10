package tds.itemrenderer.data;

import tds.itemrenderer.data.ITSTypes.ITSEntityType;

public class ItsItemIdUtil
{
  public static String getItsDocumentId (IITSDocument document) {
    return getItsDocumentId (document.getBankKey (), document.getItemKey (), document.getType ());
  }

  public static String getItsDocumentId (long bankKey, long itemKey, ITSEntityType type) {

    final String PASSAGE_ID_FORMAT = "P-%s-%s";
    final String ITEM_ID_FORMAT = "I-%s-%s";
    final String UNKNOWN_ID_FORMAT = "U-%s-%s";

    String formatString = null;
    if (type == ITSEntityType.Item)
      formatString = ITEM_ID_FORMAT;
    else if (type == ITSEntityType.Passage)
      formatString = PASSAGE_ID_FORMAT;
    else
      // TODO what should we do here?
      formatString = UNKNOWN_ID_FORMAT;
    return String.format (formatString, bankKey, itemKey);
  }
}
