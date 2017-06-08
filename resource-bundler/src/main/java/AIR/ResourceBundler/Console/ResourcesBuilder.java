/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *       
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package AIR.ResourceBundler.Console;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Iterator;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;

import AIR.Common.Utilities.Path;
import AIR.Common.Web.Session.HttpContext;
import AIR.Common.time.DateTime;
import AIR.ResourceBundler.Xml.FileSet;
import AIR.ResourceBundler.Xml.FileSetInput;
import AIR.ResourceBundler.Xml.Resources;


// / <summary>
// / This takes a resouces object and combines all the file sets.
// / </summary>
public class ResourcesBuilder
{
  private String    _parentFolder;
  private Resources _resources;

  public ResourcesBuilder (String parentFolder, Resources resources)
  {
    _parentFolder = parentFolder;
    _resources = resources;
  }

  // / <summary>
  // / Combine all the files and save them to output directories.
  // / </summary>
  public void build () throws Exception
  {
    Iterator<FileSet> it = _resources.getFileSets ();
    while (it.hasNext ())
    {
      FileSet fileSet = it.next ();
      // check if there is an output file
      if (!StringUtils.isEmpty (fileSet.getOutput ()))
      {
        processParentResource (fileSet);
      }
    }
  }

  private void processParentResource (FileSet fileSet) throws Exception
  {
    String outputFile = Path.combine (_parentFolder, fileSet.getOutput ());
    outputFile = outputFile.replace ('/', File.separatorChar);
    File outputFolder = new File (outputFile).getParentFile ();

    // make sure output folder exists
    if (!outputFolder.exists ())
    {
      FileUtils.forceMkdir (outputFolder);
    }

    File output = new File (outputFile);
    output.createNewFile ();

    FileWriter sw = new FileWriter (output);

    sw.write ("/*\n");
    sw.write (String.format ("Copyright (c) %s, American Institutes for Research. All rights reserved.\n", DateTime.getNow ().getYear ()));
    sw.write (String.format ("GENERATED: %s\n", DateTime.getNow ().toString ()));
    // TODO Shajib: In .net code Environment.MachineName used
    int machineHash = HttpContext.getCurrentContext ().getServer ().hashCode ();
    String machineID = Integer.toString (machineHash);
    sw.write (String.format ("MACHINE: %s\n", machineID));
    sw.write ("*/\n");
    sw.write ("\n");

    Iterator<FileSetInput> it = _resources.getFileInputs (fileSet.getName ());
    FileSetInput file = null;

    for (; it.hasNext ();)
    {
      file = it.next ();
      writeFileInput (sw, file);
    }
  }

  private void writePrepend (FileWriter sw, FileSetInput fileInput)
  {
    if (!StringUtils.isBlank (fileInput.getPrepend ()))
    {
      try {
        sw.write (fileInput.getPrepend ());
      } catch (IOException e) {
      }
    }
  }

  private void writeAppend (FileWriter sw, FileSetInput fileInput)
  {
    if (!StringUtils.isBlank (fileInput.getAppend ()))
    {
      try {
        sw.write (fileInput.getAppend ());
      } catch (IOException e) {
      }
    }
  }

  private void writeFileInput (FileWriter sw, FileSetInput fileInput) throws IOException
  {
    FileSet fileSet = fileInput.getParent ();

    if (StringUtils.isEmpty (fileInput.getPath ()))
    {
      throw new FileNotFoundException ("No file path defined for the input " + fileSet.getName ());
    }

    // get file info
    String filePath = Path.combine (_parentFolder, fileInput.getPath ());
    filePath = filePath.replace ('/', File.separatorChar);
    String fileName = Path.getFileName (fileInput.getPath ());

    if (StringUtils.isEmpty (fileName))
    {
      throw new IOException (String.format ("Could not find the file name in the path \"%s\".", filePath));
    }

    // write out file header
    writeFileHeader (sw, filePath);
    writePrepend (sw, fileInput);

    // read input file
    try (BufferedReader sr = new BufferedReader (new FileReader (filePath))) {

      boolean compressed = false;

      // check if we can compress this resource group
      if (fileSet.isCompress ())
      {
        String fileExt = Path.getExtension (fileName).toLowerCase ();

        // check if this file supports compression
        if ("js".equals (fileExt))
        {
          compressJS (sw, sr, fileSet);
          compressed = true;
        }
      }

      // if no compression was performed then add the file as is
      if (!compressed)
      {
        String line;

        while ((line = sr.readLine ()) != null)
        {
          sw.write (line + "\n");
        }
      }

      writeAppend (sw, fileInput);
      sw.write ("\n");
    }
  }

  private static void compressJS (FileWriter sw, BufferedReader sr, FileSet fileSet) throws IOException
  {
    // TODO Shajib: implement this
    // compress javascript into output file
    /*
     * JSMin jsMin = new JSMin (sw, sr); jsMin.SettingsRemoveEmptyLines =
     * fileSet.isRemoveEmptyLines (); jsMin.SettingsRemoveComments =
     * fileSet.isRemoveComments (); jsMin.SettingsRemoveSpaces =
     * fileSet.isRemoveSpaces (); jsMin.Compress ();
     */
    String line;
    while ((line = sr.readLine ()) != null)
    {
      line = line.trim ();
      sw.write (line + "\n");
    }
  }

  private static void writeFileHeader (FileWriter sw, String filePath) throws IOException
  {
    File scriptInfo = new File (filePath);

    // get file crc
    String crcResult = "";

    FileInputStream fs = new FileInputStream (filePath);
    byte[] bb = new byte[4];
    int i = fs.hashCode ();
    for (int k = 3, j = 0; k >= 0; k--, j += 8)
    {
      bb[k] = (byte) (i >> j);
    }

    for (byte b : bb)
      crcResult += String.format ("%2X", b).toLowerCase ();

    // write out script info
    String resourceFile = Path.getFileName (filePath);
    sw.write (String.format ("/* SOURCE FILE: %s (%s) %s */\n", resourceFile, crcResult, scriptInfo.lastModified ()));
    sw.write ("\n");
  }
}
