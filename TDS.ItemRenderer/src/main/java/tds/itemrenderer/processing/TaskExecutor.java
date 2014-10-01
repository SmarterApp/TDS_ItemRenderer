/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import java.util.ArrayList;
import java.util.List;

import tds.itemrenderer.data.ITSDocumentXml;
import tds.itemrenderer.data.ITSTypes.ITSContentType;
import tds.itemrenderer.data.ITSTypes.ITSContextType;

/**
 * @author jmambo
 *
 */
public class TaskExecutor<T>
{
  private final List<IProcessorTask<T>> _processorTasks = new ArrayList<IProcessorTask<T>>();

  /**
   * Gets a count of process tasks
   * 
   * @return process task count
   */
  public int getCount() {
     return _processorTasks.size ();
  }

  /**
   * Registers a task
   * 
   * @param process
   */
  public void registerTask(IProcessorTask<T> process)  {
      _processorTasks.add(process);
  }

  /**
   * Execute tasks
   * 
   * @param itsDocument
   * @param contentType
   * @param contextType
   * @param language
   * @param data
   * @return
   */
  protected T executeTasks(ITSDocumentXml itsDocument, ITSContentType contentType, ITSContextType contextType, String language, T data)  {
      if (data == null) {
        return null;
      }

      for (IProcessorTask<T> processorTask : _processorTasks) {
          // if this task executes other tasks then see if it currently contains any tasks
          if (processorTask instanceof TaskExecutor) {
             if (TaskExecutor.class.cast (processorTask).getCount () == 0) {
               continue;
             }
          }
          // check if this task supports the content type being passed in
          if ((processorTask.getContentSupported() & contentType.getValue ()) == contentType.getValue ()) {
              data = processorTask.process(itsDocument, contentType, contextType, language, data);
          }
      }
      return data;
  }
  
}
