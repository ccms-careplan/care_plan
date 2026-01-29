import os
from rest_framework import serializers
from .models import Assessment

# class AssessmentUploadSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Assessment
#         fields = ('id','resident','source_type','pdf_file','structured_data','status')
#         read_only_fields = ('structured_data','status')



class AssessmentUploadSerializer(serializers.ModelSerializer):
    def validate_document_file(self, file):
        ext = os.path.splitext(file.name)[1].lower()
        if ext not in [".pdf", ".docx"]:
            raise serializers.ValidationError(
                "Only PDF and DOCX files are supported."
            )
        return file

    class Meta:
        model = Assessment
        fields = (
            "id",
            "company",
            "resident",
            "source_type",
            "document_file",
            "structured_data",
            "status",
        )
        read_only_fields = ("structured_data", "status")        
