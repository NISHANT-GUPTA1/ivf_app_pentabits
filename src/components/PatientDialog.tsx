import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { UserPlus, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Patient {
  id: number;
  name: string;
  mrn: string;
  dob?: string;
  clinic_id: number;
  age?: number;
  contact_number?: string;
  email?: string;
  address?: string;
}

interface PatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPatient: (patient: Patient) => void;
}

export const PatientDialog: React.FC<PatientDialogProps> = ({
  open,
  onOpenChange,
  onSelectPatient
}) => {
  const { token } = useAuth();
  const [mode, setMode] = useState<'search' | 'create'>('search');
  const [searchMRN, setSearchMRN] = useState('');
  const [newName, setNewName] = useState('');
  const [newMRN, setNewMRN] = useState('');
  const [newDOB, setNewDOB] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);

  const handleSearch = async () => {
    if (!searchMRN.trim()) {
      setError('Please enter a Medical Record Number');
      return;
    }

    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Verifying token before search...');
      
      // First verify token is valid
      const verifyResponse = await fetch('http://localhost:8001/auth/verify-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Token verification status:', verifyResponse.status);

      if (verifyResponse.status === 401) {
        setError('Session expired. Please log in again.');
        return;
      }

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error('Token verification error:', errorText);
        setError('Session expired. Please log in again.');
        return;
      }

      const verifyData = await verifyResponse.json();
      console.log('Token is valid:', verifyData);

      // Token is valid, now search patients
      console.log('Searching patients with valid token...');
      
      const response = await fetch('http://localhost:8001/patients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Search response status:', response.status);

      if (response.status === 401) {
        setError('Session expired. Please log in again.');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search error:', errorText);
        throw new Error(`Failed to fetch patients: ${errorText}`);
      }

      const patients = await response.json();
      const filtered = patients.filter((p: Patient) => 
        p.mrn.toLowerCase().includes(searchMRN.toLowerCase())
      );

      setSearchResults(filtered);
      if (filtered.length === 0) {
        setError('No patients found with that MRN');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      setError('Patient name is required');
      return;
    }

    if (!newMRN.trim()) {
      setError('Medical Record Number is required');
      return;
    }

    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Verifying token before create...');
      
      // First verify token is valid
      const verifyResponse = await fetch('http://localhost:8001/auth/verify-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Token verification status:', verifyResponse.status);

      if (verifyResponse.status === 401) {
        setError('Session expired. Please log in again.');
        return;
      }

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error('Token verification error:', errorText);
        setError('Session expired. Please log in again.');
        return;
      }

      const verifyData = await verifyResponse.json();
      console.log('Token is valid:', verifyData);

      // Token is valid, now create patient
      console.log('Creating patient with valid token...');
      
      const response = await fetch('http://localhost:8001/patients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clinic_id: 1, // Default clinic, should come from user context
          name: newName,
          mrn: newMRN,
          dob: newDOB ? new Date(newDOB).toISOString() : null,
          age: newAge ? parseInt(newAge) : null,
          contact_number: newMobile,
          email: newEmail || null,
          address: newAddress
        })
      });

      console.log('Create response status:', response.status);

      if (response.status === 401) {
        setError('Session expired. Please log in again.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Create error:', errorData);
        throw new Error(errorData.detail || 'Failed to create patient');
      }

      const newPatient = await response.json();
      onSelectPatient(newPatient);
      onOpenChange(false);
      
      // Reset form
      setNewName('');
      setNewMRN('');
      setNewDOB('');
      setNewAge('');
      setNewMobile('');
      setNewEmail('');
      setNewAddress('');
      setMode('search');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create patient');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Patient Selection</DialogTitle>
          <DialogDescription>
            Search for an existing patient or create a new patient record
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === 'search' ? 'default' : 'outline'}
            onClick={() => setMode('search')}
            className="flex-1"
          >
            <Search className="w-4 h-4 mr-2" />
            Search Patient
          </Button>
          <Button
            variant={mode === 'create' ? 'default' : 'outline'}
            onClick={() => setMode('create')}
            className="flex-1"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            New Patient
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
            {error}
            {error.includes('Session expired') && (
              <div className="mt-2 text-xs">
                Please log out and log back in to refresh your session.
              </div>
            )}
          </div>
        )}

        {!token && (
          <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-md text-sm">
            ⚠️ Authentication token not found. Please refresh the page or log in again.
          </div>
        )}

        {mode === 'search' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Medical Record Number (MRN)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter MRN..."
                  value={searchMRN}
                  onChange={(e) => setSearchMRN(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-md divide-y">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      onSelectPatient(patient);
                      onOpenChange(false);
                    }}
                  >
                    <div className="font-medium">ID: {patient.id}</div>
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-gray-600">MRN: {patient.mrn}</div>
                    {patient.dob && (
                      <div className="text-sm text-gray-600">
                        DOB: {new Date(patient.dob).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="new-name">Full Name*</Label>
              <Input
                id="new-name"
                placeholder="e.g., John Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-age">Age*</Label>
              <Input
                id="new-age"
                type="number"
                placeholder="e.g., 32"
                value={newAge}
                onChange={(e) => setNewAge(e.target.value)}
                required
                min="18"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-mobile">Mobile Number*</Label>
              <Input
                id="new-mobile"
                type="tel"
                placeholder="e.g., +1 (555) 123-4567"
                value={newMobile}
                onChange={(e) => setNewMobile(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">Email (Optional)</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="e.g., john.doe@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-address">Address*</Label>
              <Input
                id="new-address"
                placeholder="e.g., 123 Main St, City, State, ZIP"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-mrn">Medical Record Number (MRN)*</Label>
              <Input
                id="new-mrn"
                placeholder="e.g., PAT-12345"
                value={newMRN}
                onChange={(e) => setNewMRN(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-dob">Date of Birth (Optional)</Label>
              <Input
                id="new-dob"
                type="date"
                value={newDOB}
                onChange={(e) => setNewDOB(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleCreate} 
              disabled={isLoading || !newName || !newAge || !newMobile || !newAddress || !newMRN}
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Create Patient'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
