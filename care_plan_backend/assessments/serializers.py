from rest_framework import serializers
from .models import Assessment

# class AssessmentUploadSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Assessment
#         fields = ('id','resident','source_type','pdf_file','structured_data','status')
#         read_only_fields = ('structured_data','status')


class AssessmentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = ('id', 'company', 'resident', 'source_type', 'pdf_file', 'structured_data', 'status')
        read_only_fields = ('structured_data', 'status')
