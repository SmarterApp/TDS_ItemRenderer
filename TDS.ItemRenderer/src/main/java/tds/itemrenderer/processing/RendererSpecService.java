package tds.itemrenderer.processing;

import java.io.IOException;

/**
 * Implementations of this interface are responsible for reading
 * retrieving a RendererSpec by path.
 */
public interface RendererSpecService {

    /**
     * Find the Renderer Spec specified by the given path.
     *
     * @param rendererSpecPath The path to the renderer spec
     * @return  The renderer spec contents
     * @throws IOException if there is a problem reading the renderer spec
     */
    String findOne(final String rendererSpecPath) throws IOException;
}
