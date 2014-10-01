/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.web;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import javax.xml.stream.FactoryConfigurationError;
import javax.xml.stream.XMLStreamException;

import org.codehaus.stax2.XMLStreamWriter2;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Element;

import tds.itemrenderer.processing.XmlUtils;
import AIR.Common.Web.EncryptionHelper;
import AIR.Common.xml.TdsXmlOutputFactory;

/**
 * @author jmambo
 *
 */
public class XmlWriter
{
  
  private static final Logger _logger   = LoggerFactory.getLogger (XmlWriter.class);
  
  private XMLStreamWriter2 _writer;
  
  public XmlWriter (OutputStream stream)  {
    try {
      _writer = (XMLStreamWriter2) TdsXmlOutputFactory.newInstance ().createXMLStreamWriter (stream, "UTF-8");
      _writer.writeStartDocument ("UTF-8", "1.0");
    } catch (XMLStreamException | FactoryConfigurationError e) {
       throw new XmlWriterException(e.getMessage (), e);
    }
  }

  
  /**
   * @param name
   */
  public void writeStartElement (String name) {
    try {
      _writer.writeStartElement (name);
    } catch (XMLStreamException e) {
      throw new XmlWriterException(e.getMessage (), e);
    }
    
  }

  /**
   * 
   */
  public void writeEndElement () {
    try {
      _writer.writeEndElement ();
    } catch (XMLStreamException e) {
      throw new XmlWriterException(e.getMessage (), e);
    }
    
  }

  /**
   * @param name
   * @param string
   */
  public void writeAttributeString (String name, String value) {
    try {
      _writer.writeAttribute (name, value);
    } catch (XMLStreamException e) {
      throw new XmlWriterException(e.getMessage (), e);
    }
    
  }

  /**
   * @param value
   */
  public void writeCData (String value) {
    try {
      _writer.writeCData (value);
    } catch (XMLStreamException e) {
      throw new XmlWriterException(e.getMessage (), e);
    }
    
  }

  /**
   * @param string
   */
  public void writeString (String value) {
    try {
      _writer.writeCharacters (value);
    } catch (XMLStreamException e) {
      throw new XmlWriterException(e.getMessage (), e);
    }
  }

  /**
   * @param text
   */
  public void writeRaw (String text) {
    try {
      _writer.writeRaw (text);
    } catch (XMLStreamException e) {
      throw new XmlWriterException(e.getMessage (), e);
    }
  }

  /**
   * @param buffer
   * @param i
   * @param bytesRead
   */
  public void writeBase64 (byte[] buffer, int i, int bytesRead) {
   
    try {
      String str = new String(buffer, i, bytesRead, StandardCharsets.UTF_8); 
      String encodedStr = EncryptionHelper.EncryptToBase64(str);
      _writer.writeCharacters (encodedStr);
    } catch (XMLStreamException e) {
      throw new XmlWriterException(e.getMessage (), e);
    }
  }

 /**
   * @param buffer
   * @param i
   * @param bytesRead
   */
  public void writeRaw (byte[] buffer, int i, int bytesRead) {
    try {
      String str = new String(buffer, i, bytesRead, StandardCharsets.UTF_8); 
      _writer.writeRaw (str);
    } catch (XMLStreamException e) {
      throw new XmlWriterException(e.getMessage (), e);
    }
  }
  
  public void writeElement(Element element) {
    try {
      if (element != null) {
         _writer.writeRaw(XmlUtils.getXml(element));
      }
    } catch (Exception e) {
      //This method is used for generic elements which are currently not used so no need of throwing exception
      _logger.warn(e.getMessage());
      //TODO:
      //throw new XmlWriterException(e);
    }
  }
  
  /**
   * 
  */
  public void close () {
    try {
      _writer.writeEndDocument ();
      _writer.flush ();
      _writer.close ();
    } catch (XMLStreamException e) {
       throw new XmlWriterException(e.getMessage (), e);
    } finally {
      try {
        if (_writer != null) {
          _writer.close ();
        }
      } catch (XMLStreamException e) {
         throw new XmlWriterException(e.getMessage (), e);
      }
    }
  }



}

