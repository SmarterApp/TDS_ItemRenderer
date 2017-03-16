package tds.itemrenderer.processing;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;

/**
 * Handles reading the item XML
 */
public interface ItemDataReader {
  /**
   * Returns an input stream containing the Item data
   *
   * @param uri uri to the xml
   * @return {@link java.io.InputStream}
   * @throws IOException if there is any issue accessing the data
   */
  InputStream readData(URI uri) throws IOException;
}
