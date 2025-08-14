import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

// Helper function to get the authenticated user's ID
const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");
  return user.id;
};

export const getPlants = async () => {
  const { data, error } = await supabase
    .from('plants')
    // V-- Add 'created_at' here --V
    .select('id, name, created_at, variety_id(common_name)')
    .eq('archived', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getPlantById = async (id) => {
  const { data, error } = await supabase
    .from('plants')
    .select(`
      *,
      variety:plant_varieties (common_name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const getGardenBeds = async () => {
  const { data, error } = await supabase
    .from('garden_beds')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getGardenBedById = async (id) => {
  const { data, error } = await supabase
    .from('garden_beds')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const getPlantsByBedId = async (bedId) => {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('bed_id', bedId)
    .eq('archived', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createPlant = async (plantData) => {
  const owner_id = await getUserId();
  const { data, error } = await supabase
    .from('plants')
    .insert([{ ...plantData, owner_id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePlant = async (id, plantData) => {
  const { data, error } = await supabase
    .from('plants')
    .update(plantData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createGardenBed = async (bedData) => {
  const owner_id = await getUserId();
  const { data, error } = await supabase
    .from('garden_beds')
    .insert([{ ...bedData, owner_id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createJournal = async (plantId, text) => {
  const owner_id = await getUserId();
  const { data, error } = await supabase
    .from('journals')
    .insert([{
      owner_id,
      plant_id: plantId,
      text,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, plant_id, garden_bed_id, plant:plants (name), garden_bed:garden_beds (name)') // Select all task fields, plant_id, garden_bed_id, and the plant/garden_bed names
    .eq('completed', false)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data;
};

export const getTasksForPlant = async (plantId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('plant_id', plantId)
    .eq('completed', false) // Only fetch active tasks
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data;
};

export const getTasksByBedId = async (bedId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, plant:plants (name)') // Select all task fields and the plant name
    .eq('garden_bed_id', bedId)
    .eq('completed', false) // Only fetch active tasks
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data;
};

export const createTask = async (taskData) => {
  const owner_id = await getUserId();
  const { apply_to_plants, garden_bed_id, ...rest } = taskData;

  if (apply_to_plants && garden_bed_id) {
    const plants = await getPlantsByBedId(garden_bed_id);
    const tasksToCreate = plants.map(plant => ({
      owner_id,
      plant_id: plant.id,
      garden_bed_id: garden_bed_id || rest.garden_bed_id,
      title: rest.title,
      notes: rest.notes,
      due_date: rest.due_date,
      completed: false, // Ensure new tasks are incomplete
      recurring_rule: rest.recurring_rule,
      reminder_sent: rest.reminder_sent,
    }));
    const { data, error } = await supabase.from('tasks').insert(tasksToCreate).select();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        owner_id,
        plant_id: rest.plant_id,
        garden_bed_id: garden_bed_id || rest.garden_bed_id,
        title: rest.title,
        notes: rest.notes,
        due_date: rest.due_date,
        completed: false, // Ensure new tasks are incomplete
        recurring_rule: rest.recurring_rule,
        reminder_sent: rest.reminder_sent,
      }])
          .select()
          .single();
    if (error) throw error;
    return data;
  }
};

export const updateTask = async (taskId, updates) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTask = async (taskId) => {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);

  if (error) throw error;
};

export const deletePlant = async (plantId) => {
  const owner_id = await getUserId();

  // 1. List and delete all photos from Supabase Storage for this plant.
  const photoFolder = `${owner_id}/${plantId}`;
  const { data: files, error: listError } = await supabase.storage
    .from('plant-photos')
    .list(photoFolder);

  if (listError) {
    // It's okay if the folder doesn't exist, but other errors should be thrown.
    if (listError.message !== 'The resource was not found') {
      console.error('Error listing photos for deletion:', listError);
      throw listError;
    }
  }

  if (files && files.length > 0) {
    const filePaths = files.map(file => `${photoFolder}/${file.name}`);
    const { error: removeError } = await supabase.storage
      .from('plant-photos')
      .remove(filePaths);

    if (removeError) {
      console.error('Error removing photos from storage:', removeError);
      throw removeError;
    }
  }

  // 2. Delete the plant record. RLS and CASCADE will handle related table rows.
  const { error: deleteError } = await supabase.from('plants').delete().eq('id', plantId);

  if (deleteError) {
    throw deleteError;
  }
};

export const getPlantTimeline = async (plantId) => {
  const { data, error } = await supabase.functions.invoke('plant_timeline', {
    body: { plantId },
  });

  if (error) {
    throw error;
  }
  return data;
};


// UPDATED FUNCTION: Now takes plantId and adds a DB record
export const uploadPhoto = async (fileUri, plantId, journalId = null) => {
  const owner_id = await getUserId();
  const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const filePath = `${owner_id}/${plantId}/${new Date().getTime()}.jpg`;
  const contentType = 'image/jpeg';

  // Step 1: Upload the file to Storage
  const { error: uploadError } = await supabase.storage
    .from('plant-photos')
    .upload(filePath, decode(fileBase64), { contentType });

  if (uploadError) {
    throw uploadError;
  }
  
  // Step 2: Insert a record into the 'photos' table
  const { data, error: insertError } = await supabase
    .from('photos')
    .insert({
      plant_id: plantId,
      owner_id: owner_id,
      storage_path: filePath,
      journal_id: journalId,
    })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return data;
};