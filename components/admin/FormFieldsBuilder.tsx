'use client';

import React, { useState } from 'react';
import { FormFields, CustomFieldItem } from '@/types';
import {
  CheckSquare,
  Square,
  Sliders,
  Plus,
  Trash2,
  HelpCircle,
  Type,
  Hash,
  ListFilter,
  AlignLeft,
  Sparkles,
  Lock
} from 'lucide-react';

interface FormFieldsBuilderProps {
  value: FormFields;
  onChange: (fields: FormFields) => void;
}

interface StandardFieldDef {
  key: keyof Omit<FormFields, 'custom_items'>;
  label: string;
  locked?: boolean;
}

// Name, Email, Phone are permanent core fields as requested by user
const STANDARD_FIELDS: StandardFieldDef[] = [
  { key: 'name', label: 'Full Name', locked: true },
  { key: 'email', label: 'Email Address', locked: true },
  { key: 'phone', label: 'Phone Number', locked: true },
  { key: 'age', label: 'Age' },
  { key: 'organization', label: 'Organization / Company' },
  { key: 'role', label: 'Role / Job Title' },
  { key: 'dietary', label: 'Dietary Preferences' },
  { key: 'tshirt_size', label: 'T-Shirt Swag Size' },
  { key: 'notes', label: 'Special Accommodations / Notes' },
];

export const FormFieldsBuilder: React.FC<FormFieldsBuilderProps> = ({
  value,
  onChange,
}) => {
  const customItems: CustomFieldItem[] = value.custom_items || [];

  const toggleEnabled = (key: keyof Omit<FormFields, 'custom_items'>) => {
    const current = value[key] || { enabled: false, required: false };
    onChange({
      ...value,
      [key]: {
        ...current,
        enabled: !current.enabled,
        required: current.enabled ? false : current.required,
      },
    });
  };

  const toggleRequired = (key: keyof Omit<FormFields, 'custom_items'>) => {
    const current = value[key] || { enabled: false, required: false };
    if (!current.enabled) return;
    onChange({
      ...value,
      [key]: {
        ...current,
        required: !current.required,
      },
    });
  };

  // Add a new custom field
  const handleAddCustomField = () => {
    const newField: CustomFieldItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      label: 'New Question / Field',
      type: 'text',
      required: false,
      placeholder: 'Enter response...',
    };
    onChange({
      ...value,
      custom_items: [...customItems, newField],
    });
  };

  // Update a custom field
  const handleUpdateCustomField = (id: string, updates: Partial<CustomFieldItem>) => {
    const updated = customItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    onChange({
      ...value,
      custom_items: updated,
    });
  };

  // Remove a custom field
  const handleRemoveCustomField = (id: string) => {
    onChange({
      ...value,
      custom_items: customItems.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-white">Dynamic Form Fields Configuration</h4>
        </div>
        <span className="text-[11px] text-slate-400">
          Name, Email &amp; Phone are permanent core inputs
        </span>
      </div>

      {/* 1. Permanent Core & Standard Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STANDARD_FIELDS.map((f) => {
          const cfg = value[f.key] || { enabled: false, required: false };
          const isEnabled = f.locked ? true : cfg.enabled;
          const isRequired = f.locked ? true : cfg.required;

          return (
            <div
              key={f.key}
              className={`p-3.5 rounded-2xl border transition-all duration-200 space-y-3 ${
                isEnabled
                  ? 'bg-slate-900/80 border-amber-500/30 shadow-md'
                  : 'bg-slate-950/40 border-white/10 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{f.label}</span>
                  {f.locked && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-400 font-mono text-[9px] border border-amber-500/30">
                      <Lock className="w-2.5 h-2.5" /> Permanent
                    </span>
                  )}
                </span>

                <button
                  type="button"
                  disabled={f.locked}
                  onClick={() => toggleEnabled(f.key)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isEnabled ? 'bg-amber-500' : 'bg-slate-700'
                  } ${f.locked ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Requirement Toggle Checkbox */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                <span className="text-slate-400">Mandatory?</span>
                <button
                  type="button"
                  disabled={f.locked || !isEnabled}
                  onClick={() => toggleRequired(f.key)}
                  className={`flex items-center gap-1.5 font-medium transition cursor-pointer ${
                    isRequired
                      ? 'text-amber-400'
                      : 'text-slate-400 hover:text-slate-200'
                  } ${f.locked || !isEnabled ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  {isRequired ? (
                    <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                  <span>{isRequired ? 'Required' : 'Optional'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. CUSTOM EVENT FIELDS BUILDER (+ Add Symbol Section) */}
      <div className="pt-4 border-t border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Event-Specific Custom Form Fields</span>
            </h5>
            <p className="text-xs text-slate-400 mt-0.5">
              Create tailored questions, upload requirements, student/license IDs, or dropdowns specific to this event.
            </p>
          </div>

          {/* Add Symbol Button */}
          <button
            type="button"
            onClick={handleAddCustomField}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-extrabold text-xs shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Custom Field</span>
          </button>
        </div>

        {/* List of Custom Fields */}
        {customItems.length === 0 ? (
          <div
            onClick={handleAddCustomField}
            className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-white/15 hover:border-amber-500/40 text-center space-y-2 cursor-pointer transition group"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-amber-500/10 flex items-center justify-center mx-auto transition">
              <Plus className="w-5 h-5 text-slate-400 group-hover:text-amber-400 stroke-[2.5]" />
            </div>
            <p className="text-xs font-semibold text-slate-300 group-hover:text-white">
              No custom fields added yet. Click to add event-specific questions.
            </p>
            <p className="text-[11px] text-slate-500">
              e.g. &ldquo;GitHub Profile URL&rdquo;, &ldquo;Dietary Details&rdquo;, &ldquo;Student ID / Institution&rdquo;, or &ldquo;Experience Level&rdquo;
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {customItems.map((item, index) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 shadow-lg space-y-3 animate-in fade-in duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Field Label Input */}
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                      Field #{index + 1} Question / Label
                    </label>
                    <input
                      type="text"
                      required
                      value={item.label}
                      onChange={(e) => handleUpdateCustomField(item.id, { label: e.target.value })}
                      placeholder="e.g. GitHub Profile URL, College / University, Years of Experience..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Field Type Selector */}
                  <div className="w-full sm:w-44">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Input Type
                    </label>
                    <select
                      value={item.type}
                      onChange={(e) =>
                        handleUpdateCustomField(item.id, {
                          type: e.target.value as CustomFieldItem['type'],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="text">Text (Single-line)</option>
                      <option value="textarea">Paragraph (Multi-line)</option>
                      <option value="number">Numeric (Number)</option>
                      <option value="select">Dropdown Menu (Select)</option>
                    </select>
                  </div>

                  {/* Mandatory Toggle */}
                  <div className="flex items-center gap-3 pt-4 sm:pt-0 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateCustomField(item.id, { required: !item.required })}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        item.required
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {item.required ? (
                        <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                      <span>{item.required ? 'Mandatory' : 'Optional'}</span>
                    </button>

                    {/* Delete Custom Field Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(item.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                      title="Remove this custom field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* If Dropdown type: Allow configuring options */}
                {item.type === 'select' && (
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-300">
                      Dropdown Options (comma-separated):
                    </label>
                    <input
                      type="text"
                      value={(item.options || []).join(', ')}
                      onChange={(e) =>
                        handleUpdateCustomField(item.id, {
                          options: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="e.g. Student, Software Engineer, Data Scientist, Founder"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};