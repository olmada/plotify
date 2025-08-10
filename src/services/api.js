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

// NEW FUNCTION: Fetch photos for a specific plant
export const getPhotosForPlant = async (plantId) => {
  if (!plantId) return [];

  const { data: photos, error } = await supabase
    .from('photos')
    .select('id, storage_path')
    .eq('plant_id', plantId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching photos:', error);
    return [];
  }

  // For each photo, get its public URL from Storage
  const photosWithUrls = photos.map(photo => {
    const { data } = supabase
      .storage
      .from('plant-photos')
      .getPublicUrl(photo.storage_path);
    
    return {
      id: photo.id,
      url: data.publicUrl
    };
  });
  
  return photosWithUrls;
};


// UPDATED FUNCTION: Now takes plantId and adds a DB record
export const uploadPhoto = async (fileUri, plantId) => {
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
    })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return data;
};