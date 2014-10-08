/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.web;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.io.FileUtils;
import org.w3c.dom.Element;

/**
 * @author jmambo
 *
 */
public abstract class XmlSerializable
{
  
  private XmlWriter _writer;

  protected void setWriter(XmlWriter xmlWriter)
  {
      _writer = xmlWriter;
  }

  protected void clearWriter()
  {
      _writer = null;
  }
  
  protected void startElement(String name)
  {
      _writer.writeStartElement(name);
  }

  protected void endElement()
  {
      _writer.writeEndElement();
  }

  protected <T> void writeAttribute(String name, T value)
  {
      if (value == null)
      {
          _writer.writeAttributeString(name, "");
      }
      else if (value.getClass () == Boolean.class)
      {
          _writer.writeAttributeString(name, value.toString().toLowerCase ());
      }
      else
      {
          _writer.writeAttributeString(name, value.toString());
      }
  }

  protected <T> boolean writeCData(String name, T value)
  {
      if (value == null) {
        return false;
      }
      _writer.writeStartElement(name);
      _writer.writeCData(value.toString());
      _writer.writeEndElement();
      return true;
  }   

  protected boolean writeCData(String value)
  {
      if (value == null) return false;
      _writer.writeCData(value);
      return true;
  }

  protected <T> boolean writeElement(String name, T value)
  {
      if (value == null) return false;
      _writer.writeStartElement(name);
      _writer.writeString(value.toString());
      _writer.writeEndElement();
      return true;
  }

  /**
   * Write out the beginning of the CDATA tag.
   */
  protected void writeCDataStart()
  {
      _writer.writeRaw("<![CDATA[");
  }

  /**
   * Write out any raw text or xml (will not get encoded).
   * 
   * @param text
   */
  protected void writeText(String text)  {
      _writer.writeRaw(text);
  }


  /**
   *  Write out the end of the CDATA tag.
   */
  protected void writeCDataEnd() {
      _writer.writeRaw("]]>");
  }

  /**
   * Write out the text contents of a file.
   * 
   * @param filePath
   */
  protected void writeFile(String filePath)
  {
     try {
      _writer.writeRaw(FileUtils.readFileToString (new File (filePath)));
    } catch (IOException e) {
       throw new XmlWriterException (e);
    }
  }
  
  /**
   * @param inputStream
   */
  protected void writeStream (InputStream inputStream) {
    final int bufferSize = 8192; 
    byte[] buffer = new byte[bufferSize];
    try (DataInputStream  dis = new DataInputStream(inputStream)) {
      int bytesRead = 0;
      while (bytesRead != -1) {
        bytesRead = dis.read(buffer, 0, bufferSize);
        if (bytesRead > 0) {
          _writer.writeRaw(buffer, 0, bytesRead);
        }
      }; 
    } catch (IOException e) {
      throw new XmlWriterException (e);
    }
  }


  /**
   * Convert the contents of a stream to Base64 and write it out to xml.
   *  
   * @param stream
   */
  protected void writeBase64FromStream(InputStream stream)
  {
      final int bufferSize = 65536; 
      byte[] buffer = new byte[bufferSize];
      try (DataInputStream  dis = new DataInputStream(stream)) {
        int bytesRead;
        do
        {
          bytesRead = dis.read(buffer, 0, bufferSize);
          _writer.writeBase64(buffer, 0, bytesRead);
        } while (bufferSize <= bytesRead);
      } catch (IOException e) {
        throw new XmlWriterException (e);
      }
     
  }

  /**
   * Convert the contents of a file to Base64 and write it out to xml.
   * 
   * @param filePath
   */
  protected void writeBase64FromFile(String filePath)
  {
     try (FileInputStream fileStream = new  FileInputStream(new File(filePath))) {
    //TODO:
       writeBase64FromStream (fileStream);
     } catch (IOException e) {
       throw new XmlWriterException(e);
    }
  }
  
  protected void writeElement(Element element) {
    _writer.writeElement(element);
  }
  
}
