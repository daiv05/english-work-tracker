import { useEffect, useState, useRef } from 'react'
import { Modal } from './ui/Modal'
import { useToast } from './ui/ToastProvider'
import { SearchSelect } from './ui/SearchSelect'
import { useProfileStore } from '#/store/profile'

interface ProfileModalProps {
  open: boolean
  onClose: () => void
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const toast = useToast()
  const {
    username,
    avatarData,
    plans,
    activePlanId,
    setUsername,
    setAvatarData,
    setActivePlan,
  } = useProfileStore()
  const [nameInput, setNameInput] = useState(username)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setNameInput(username)
  }, [open, username])

  function handleSave() {
    const trimmed = nameInput.trim()
    if (trimmed) setUsername(trimmed)
    toast.success('Profile updated.')
    onClose()
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setAvatarData(result)
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveAvatar() {
    setAvatarData(undefined)
  }

  const inputClass =
    'w-full border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-transparent placeholder:text-outline'

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile">
      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {avatarData ? (
              <img
                src={avatarData}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-outline-variant"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-dark flex items-center justify-center text-2xl font-bold text-white select-none">
                {(nameInput.trim().charAt(0) || '?').toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-secondary text-white flex items-center justify-center shadow-md hover:bg-secondary-hover transition-colors"
              title="Change photo"
            >
              <svg
                width="12"
                height="12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          {avatarData && (
            <button
              onClick={handleRemoveAvatar}
              className="cursor-pointer text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Remove photo
            </button>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant mb-1">
            Display name
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant mb-1">
            Active study plan
          </label>
          <SearchSelect
            options={plans.map((p) => ({ value: p.id!, label: p.name }))}
            value={activePlanId}
            onChange={(val) => {
              const id = Number(val)
              if (id) {
                void setActivePlan(id)
                  .then(() => toast.success('Active plan changed.'))
                  .catch(() => toast.error('Could not switch active plan.'))
              }
            }}
            placeholder="Select plan"
            searchPlaceholder="Search plans…"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="cursor-pointer flex-1 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="cursor-pointer flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}
