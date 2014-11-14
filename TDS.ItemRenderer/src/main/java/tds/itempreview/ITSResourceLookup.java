package tds.itempreview;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;

import AIR.Common.Json.JsonHelper;
import AIR.Common.Utilities.Path;
import AIR.Common.Web.Session.Server;

public class ITSResourceLookup
{
  public static String getPath (long bankKey, long itemKey) throws IOException {
    if (StringUtils.isEmpty (ItemPreviewSettings.getResourceLookupPath ().getValue ()))
      return null;

    String fullResourceLookupPath = Server.mapPath (ItemPreviewSettings.getResourceLookupPath ().getValue ());

    if (Path.exists (fullResourceLookupPath)) {
      String resourceLookupText = FileUtils.readFileToString (new File (fullResourceLookupPath));
      List<ITSResourceConfig> itsResourceConfigs = ITSResourceConfig.deserializeFromJson (resourceLookupText);

      for (ITSResourceConfig itsResourceConfig : itsResourceConfigs) {
        if (bankKey == itsResourceConfig.getBankKey () && itemKey == itsResourceConfig.getItemKey ()) {
          return Server.mapPath (itsResourceConfig.getFile ());
        }
      }
    }

    return null;
  }
}
