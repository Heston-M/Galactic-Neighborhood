import { JsonPage } from './page';

/**
 * Database table row types for all page tables
 * All tables share the same schema: id, name, data
 */

export interface CharacterOptionPage {
  id: number;
  name: string;
  data: JsonPage;
}

export interface EquipmentPage {
  id: number;
  name: string;
  data: JsonPage;
}

export interface GeneralPage {
  id: number;
  name: string;
  data: JsonPage;
}

export interface MagicPage {
  id: number;
  name: string;
  data: JsonPage;
}

export interface RulesPage {
  id: number;
  name: string;
  data: JsonPage;
}

/**
 * Union type for all page types
 */
export type Page = CharacterOptionPage | EquipmentPage | GeneralPage | MagicPage | RulesPage;

/**
 * Table name type - maps to actual Supabase table names
 */
export type PageTableName = 
  | 'character_option_pages'
  | 'equipment_pages'
  | 'general_pages'
  | 'magic_pages'
  | 'rules_pages';

/**
 * Helper type to get the page type from a table name
 */
export type PageTypeFromTable<T extends PageTableName> =
  T extends 'character_option_pages' ? CharacterOptionPage :
  T extends 'equipment_pages' ? EquipmentPage :
  T extends 'general_pages' ? GeneralPage :
  T extends 'magic_pages' ? MagicPage :
  T extends 'rules_pages' ? RulesPage :
  never;

