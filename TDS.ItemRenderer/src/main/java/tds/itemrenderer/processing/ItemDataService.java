package tds.itemrenderer.processing;

import java.io.IOException;
import java.net.URI;

/**
 * Handles reading the item XML
 */
public interface ItemDataService {
  /**
   * Returns an item data XML string.
   *
   * @param uri uri to the xml
   * @return {@link java.io.InputStream}
   * @throws IOException if there is any issue accessing the data
   */
  String readData(URI uri) throws IOException;
}
