package tds.itemrenderer.configuration;

/**
 * Contains settings for the document service
 */
public class ItemDocumentSettings {
  private boolean encryptionEnabled;

  /**
   * @return {@code true} if the
   */
  public boolean isEncryptionEnabled() {
    return encryptionEnabled;
  }

  public void setEncryptionEnabled(final boolean encryptionEnabled) {
    this.encryptionEnabled = encryptionEnabled;
  }
}
