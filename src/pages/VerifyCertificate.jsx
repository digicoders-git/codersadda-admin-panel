import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  CheckCircle2,
  Award,
  User,
  Book,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import http from "../apis/http";
import Loader from "../components/Loader";

function VerifyCertificate() {
  const { certificateId } = useParams();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await http.get(`/certificate/verify/${certificateId}`);
        if (res.data.success) {
          setCert(res.data.certificate);
        } else {
          setError("Invalid Certificate ID");
        }
      } catch (err) {
        setError("Certificate not found or invalid.");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [certificateId]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader size={60} />
      </div>
    );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="max-w-2xl w-full p-8 rounded-3xl border shadow-2xl bg-white"
        style={{ borderColor: colors.primary + "20" }}
      >
        {error ? (
          <div className="text-center py-12">
            <AlertCircle
              size={80}
              className="text-red-500 mx-auto mb-6 opacity-20"
            />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={48} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Authenticated Certificate
              </h1>
              <p className="text-green-600 font-semibold tracking-wide uppercase text-sm">
                Verified by CodersAdda
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Student Name
                    </p>
                    <p className="font-bold text-gray-800">
                      {cert.user?.fullName || cert.user?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Book className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Course Earned
                    </p>
                    <p className="font-bold text-gray-800">
                      {cert.course?.title}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Issue Date
                    </p>
                    <p className="font-bold text-gray-800">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Certificate ID
                    </p>
                    <p className="font-bold text-gray-800 text-sm">
                      {cert.certificateId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <a
                href={cert.certificateUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-xl active:scale-95"
                style={{ backgroundColor: colors.primary }}
              >
                View Original Certificate
              </a>
              <p className="mt-6 text-xs text-gray-400 italic">
                This certificate is digitally signed and carries the official
                seal of CodersAdda Education.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyCertificate;
