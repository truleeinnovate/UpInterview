import React, { useEffect, useState } from 'react';
import { Maximize, Minimize, X } from 'lucide-react';
import classNames from 'classnames';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parse } from 'date-fns';
import axios from 'axios';
import { isEmptyObject, validateFormMyProfile } from '../../../../../../utils/MyProfileValidations';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { config } from '../../../../../../config';
import { validateWorkEmail, checkEmailExists } from '../../../../../../utils/workEmailValidation.js';
import { validateProfileId } from '../../../../../../utils/OrganizationSignUpValidation.js';

Modal.setAppElement('#root');

const BasicDetailsEditPage = ({ from, usersId, setBasicEditOpen, onSuccess }) => {
  const { usersRes } = useCustomContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const resolvedId = usersId || id;

  const [formData, setFormData] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');

  useEffect(() => {
    const contact = usersRes.find(user => user.contactId === resolvedId);
    if (!contact) return;

    setFormData({
      email: contact.email || '',
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      countryCode: contact.countryCode || '+91',
      phone: contact.phone || '',
      profileId: contact.profileId || '',
      dateOfBirth: contact.dateOfBirth || '',
      gender: contact.gender || '',
      linkedinUrl: contact.linkedinUrl || '',
      portfolioUrl: contact.portfolioUrl || '',
      id: contact._id
    });

    setOriginalEmail(contact.email || '');

    if (contact.dateOfBirth?.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const parsedDate = parse(contact.dateOfBirth, 'dd-MM-yyyy', new Date());
      setStartDate(!isNaN(parsedDate.getTime()) ? parsedDate : null);
    } else {
      setStartDate(null);
    }

    setErrors({});
  }, [resolvedId, usersRes]);

  const handleDateChange = (date) => {
    if (!date) {
      setFormData(prev => ({ ...prev, dateOfBirth: '' }));
      setStartDate(null);
      return;
    }

    const formattedDate = format(date, 'dd-MM-yyyy');
    setFormData(prevData => ({ ...prevData, dateOfBirth: formattedDate }));
    setStartDate(date);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'email' && value !== originalEmail) {
      handleEmailValidation(value);
    }
  };

  const handleProfileIdValidation = (profileId) => {
  const error = validateProfileId(profileId);
  if (error) {
    setErrors(prev => ({ ...prev, profileId: error }));
  } else {
    setErrors(prev => ({ ...prev, profileId: '' }));
  }
};


  const handleEmailValidation = async (email) => {
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Work email is required' }));
      setIsCheckingEmail(false);
      return;
    }

    setIsCheckingEmail(true);

    // const formatError = validateWorkEmail(email);
    // if (formatError) {
    //   setErrors(prev => ({ ...prev, email: formatError }));
    //   setIsCheckingEmail(false);
    //   return;
    // }

    const exists = await checkEmailExists(email);
    if (exists) {
      setErrors(prev => ({ ...prev, email: 'Email already registered' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }

    setIsCheckingEmail(false);
  };

  const handleCloseModal = () => {
    if (from === 'users') {
      setBasicEditOpen(false);
    } else {
      navigate('/account-settings/my-profile/basic', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form using validateFormMyProfile
    const validationErrors = validateFormMyProfile(formData);
    setErrors(validationErrors);

    if (!isEmptyObject(validationErrors)) {
      return;
    }

    // Additional email validation if changed
    if (formData.email !== originalEmail) {
      // const emailFormatError = validateWorkEmail(formData.email);
      // if (emailFormatError) {
      //   setErrors(prev => ({ ...prev, email: emailFormatError }));
      //   return;
      // }

      const exists = await checkEmailExists(formData.email);
      if (exists) {
        setErrors(prev => ({ ...prev, email: 'Email already registered' }));
        return;
      }

      // Trigger email change request
      try {
        const response = await axios.post(
          `${config.REACT_APP_API_URL}/emails/auth/request-email-change`,
          {
            oldEmail: originalEmail,
            newEmail: formData.email,
            userId: formData.id
          }
        );

        if (response.data.success) {
          alert('Verification email sent to your new email address');
          const cleanFormData = {
            // email: originalEmail, // Keep original email until verified
            // email: formData.email !== originalEmail ? '': originalEmail,// Keep original email empty until verified
            newEmail: formData.email.trim(), // Store new email in newEmail field
            firstName: formData.firstName.trim() || '',
            lastName: formData.lastName.trim() || '',
            countryCode: formData.countryCode || '',
            phone: formData.phone.trim() || '',
            profileId: formData.profileId.trim() || '',
            dateOfBirth: formData.dateOfBirth || '',
            gender: formData.gender || '',
            linkedinUrl: formData.linkedinUrl.trim() || '',
            portfolioUrl: formData.portfolioUrl.trim() || '',
            id: formData.id
          };

          console.log("cleanFormData",cleanFormData);
          

          await axios.patch(
            `${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`,
            cleanFormData
          );

          onSuccess();
          handleCloseModal();
        } else {
          setErrors(prev => ({ ...prev, email: response.data.message }));
        }
      } catch (error) {
        console.error('Error requesting email change:', error);
        setErrors(prev => ({ ...prev, email: 'Failed to send verification email' }));
      }
    } else {
      // Proceed with normal update if email is unchanged
      const cleanFormData = {
        email: formData.email.trim() || '',
        firstName: formData.firstName.trim() || '',
        lastName: formData.lastName.trim() || '',
        countryCode: formData.countryCode || '',
        phone: formData.phone.trim() || '',
        profileId: formData.profileId.trim() || '',
        dateOfBirth: formData.dateOfBirth || '',
        gender: formData.gender || '',
        linkedinUrl: formData.linkedinUrl.trim() || '',
        portfolioUrl: formData.portfolioUrl.trim() || '',
        id: formData.id
      };

      try {
        const response = await axios.patch(
          `${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`,
          cleanFormData
        );

        if (response.status === 200) {
          onSuccess();
          handleCloseModal();
        } else {
          setErrors(prev => ({ ...prev, form: 'Failed to save changes' }));
        }
      } catch (error) {
        console.error('Error saving changes:', error);
        setErrors(prev => ({ ...prev, form: 'Error saving changes' }));
      }
    }
  };

  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
    {
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
    }
  );

  return (
    <Modal
      isOpen={true}
      onRequestClose={handleCloseModal}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className={classNames('h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-custom-blue">Edit Basic Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Maximize className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && <p className="text-red-500 text-sm mb-4">{errors.form}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    onBlur={() => formData.email !== originalEmail && handleEmailValidation(formData.email)}
                    disabled={from !== 'users'}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-custom-blue ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {isCheckingEmail && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-custom-blue ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-custom-blue ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Of Birth</label>
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  dateFormat="dd-MM-yyyy"
                  maxDate={new Date()}
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-blue"
                  wrapperClassName="w-full"
                  customInput={<input readOnly />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="profileId"
                  value={formData.profileId || ''}
                  // onChange={handleInputChange}
                  onBlur={() => handleProfileIdValidation(formData.profileId)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-custom-blue ${
                    errors.profileId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.profileId && <p className="text-red-500 text-sm mt-1">{errors.profileId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-blue"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode || '+91'}
                    onChange={handleInputChange}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-blue"
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+61">+61</option>
                    <option value="+971">+971</option>
                    <option value="+60">+60</option>
                  </select>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-custom-blue ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="linkedinUrl"
                  value={formData.linkedinUrl || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-custom-blue ${
                    errors.linkedinUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.linkedinUrl && <p className="text-red-500 text-sm mt-1">{errors.linkedinUrl}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
                <input
                  type="text"
                  name="portfolioUrl"
                  value={formData.portfolioUrl || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-blue"
                />
                {errors.portfolioUrl && <p className="text-red-500 text-sm mt-1">{errors.portfolioUrl}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-custom-blue border rounded-lg border-custom-blue"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-custom-blue text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default BasicDetailsEditPage;