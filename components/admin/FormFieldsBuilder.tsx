'use client';

import React from 'react';
import { FormFields } from '@/types';
import { CheckSquare, Square, Sliders } from 'lucide-react';

interface FormFieldsBuilderProps {
  value: FormFields;
  onChange: (fields: FormFields) => void;
}

interface FieldDef {
  key: keyof FormFields;
  label: string;
  locked?: boolean;
}

const FIELD_DEFS: FieldDef[] = [
  { key: 'name', label: 'Full Name', locked: true },
  { key: 'email', label: 'Email Address', locked: true },
  { key: 'phone', label: 'Phone Number' },
  { key: 'age', label: 'Age' },
  { key: 'organization', label: 'Organization / Company' },
  { key: 'role', label: 'Role / Job Title' },
  { key: 'dietary', label: 'Dietary Preferences' },
  { key: 'tshirt_size', label: 'T-Shirt Swag Size' },
  { key: 'notes', label: 'Special Accommodations' },
];

export const FormFieldsBuilder: React.FC<FormFieldsBuilderProps> = ({
  value,
  onChange,
}) => {
  const toggleEnabled = (key: keyof FormFields) => {
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

  const toggleRequired = (key: keyof FormFields) => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-white">Dynamic Form Fields Configuration</h4>
        </div>
        <span className="text-[11px] text-slate-400">Configure inputs displayed on public page</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FIELD_DEFS.map((f) => {
          const cfg = value[f.key] || { enabled: false, required: false };
          const isEnabled = f.locked || cfg.enabled;
          const isRequired = f.locked || cfg.required;

          return (
            <div
              key={f.key}
              className={`p-3.5 rounded-2xl border transition-all duration-200 space-y-3 ${
                isEnabled
                  ? 'bg-slate-900/80 border-amber-500/30'
                  : 'bg-slate-950/40 border-white/10 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  {f.label}
                  {f.locked && <span className="ml-1 text-[10px] text-amber-400 font-mono">(Core)</span>}
                </span>

                <button
                  type="button"
                  disabled={f.locked}
                  onClick={() => toggleEnabled(f.key)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isEnabled ? 'bg-amber-500' : 'bg-slate-700'
                  } ${f.locked ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Mandatory?</span>
                <button
                  type="button"
                  disabled={f.locked || !isEnabled}
                  onClick={() => toggleRequired(f.key)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition ${
                    isRequired
                      ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  } ${f.locked || !isEnabled ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {isRequired ? (
                    <>
                      <CheckSquare className="w-3 h-3 text-rose-400" />
                      <span>Required</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3 h-3 text-slate-500" />
                      <span>Optional</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};