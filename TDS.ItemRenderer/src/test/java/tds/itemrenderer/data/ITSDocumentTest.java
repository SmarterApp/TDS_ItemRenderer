package tds.itemrenderer.data;

import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class ITSDocumentTest {
    @Test
    public void shouldGetContentForLanguages() {
        ITSContent content = new ITSContent("ENU");
        ITSDocument document = new ITSDocument();

        document.addContent(content);

        ITSContent foundContent = document.getContent("ENU-Braille");
        assertThat(foundContent).isNotNull();

        foundContent = document.getContent("ENU");
        assertThat(foundContent).isNotNull();
    }
}