package tds.itemrenderer.service;

import java.net.URI;

import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.IITSDocument;

/**
 * Handles loading the Item Documents for display
 */
public interface ItemDocumentService {
  /**
   * Loads the {@link tds.itemrenderer.data.IITSDocument} representing item document
   *
   * @param uri            the URI to the document
   * @param accommodations the {@link tds.itemrenderer.data.AccLookup} associated with the document
   * @param resolveUrls    whether to resolve urls
   * @return {@link tds.itemrenderer.data.IITSDocument}
   */
  IITSDocument loadItemDocument(URI uri, AccLookup accommodations, boolean resolveUrls);
}
